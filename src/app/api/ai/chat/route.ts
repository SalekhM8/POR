import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();

function cosineSim(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length && i < b.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

// Simple in-memory LRU for query embedding caching (reduces one OpenAI call per repeated question)
const EMB_CACHE_MAX = 100;
const embCache = new Map<string, number[]>();
function getCachedEmbedding(key: string): number[] | undefined { return embCache.get(key); }
function setCachedEmbedding(key: string, value: number[]) {
  if (embCache.has(key)) embCache.delete(key);
  embCache.set(key, value);
  if (embCache.size > EMB_CACHE_MAX) embCache.delete(embCache.keys().next().value as string);
}
function normalize(text: string) { return text.trim().toLowerCase().replace(/\s+/g, " "); }

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const body = await req.json().catch(() => ({}));
    const userText: string = String(body.message || "").slice(0, 4000);
    if (!userText) return NextResponse.json({ error: "Empty message" }, { status: 400 });

    // Embed query with caching
    const norm = normalize(userText);
    let qvec = getCachedEmbedding(norm);
    if (!qvec) {
      const qe = await openai.embeddings.create({ model: "text-embedding-3-small", input: userText });
      qvec = qe.data[0].embedding as unknown as number[];
      setCachedEmbedding(norm, qvec);
    }

    // Pull a reasonable number of chunks from DB and rank in app (since we store JSON embeddings)
    const pool = await prisma.aIChunk.findMany({
      take: 200,
      orderBy: { updatedAt: "desc" },
      select: { type: true, title: true, content: true, embedding: true, sourceId: true },
    });
    const ranked = pool
      .map((c) => ({ c, score: cosineSim(qvec, (c.embedding as unknown as number[])) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((r) => r.c);

    // Fetch fresh package metadata for any selected package IDs
    const pkgIds = Array.from(new Set(ranked.filter(r => r.type === "package").map(r => r.sourceId)));
    const [pkgs, cases, allPackages, allCases] = await Promise.all([
      pkgIds.length > 0 ? prisma.package.findMany({ where: { id: { in: pkgIds } } }) : Promise.resolve([]),
      prisma.caseStudy.findMany({ where: { id: { in: Array.from(new Set(ranked.filter(r => r.type === "case").map(r => r.sourceId))) } } }),
      prisma.package.findMany({ orderBy: { priceCents: "asc" } }),
      prisma.caseStudy.findMany({ orderBy: { createdAt: "desc" } }),
    ]);

    const contextBlocks = ranked.map((r) => `Type: ${r.type}\nTitle: ${r.title}\nContent: ${r.content}`);
    const allowedPackageTitles = allPackages.map((p) => p.title);
    const allowedCaseTitles = allCases.map((c) => c.title);
    const catalogPackages = allPackages.slice(0, 6).map((p) => `- ${p.title}: ${p.description}`);
    const catalogCases = allCases.slice(0, 4).map((c) => `- ${c.title}: ${c.summary}`);
    const system = `You are a calm, mature consultation assistant. Style: peaceful, simple, no exclamation marks.
Rules:
- Only reference packages from the AllowedPackages list below. Use exact titles. If none are listed, do not name any packages.
- You may reference case studies only from AllowedCases.
- Include short citations like [package:Title] or [case:Title] that match Allowed lists.
- If nothing suitable is listed, offer gentle general guidance and suggest an initial consultation.`;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: system },
      { role: "user", content: `User message: ${userText.slice(0, 800)}\n\nAllowedPackages: ${allowedPackageTitles.join(" | ") || "(none)"}\nAllowedCases: ${allowedCaseTitles.join(" | ") || "(none)"}\n\nCatalog (packages):\n${catalogPackages.join("\n")}\n\nCatalog (cases):\n${catalogCases.join("\n")}\n\nContext:\n${contextBlocks.map(c=>c.slice(0,600)).join("\n---\n")}` },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 350,
      messages,
    });

    // Build lightweight recommendation cards from pkgs; the model response is primary, cards assist UI
    const baseRecs = (pkgs.length > 0 ? pkgs : allPackages).slice(0, 3);
    const recs = baseRecs.map((p) => ({
      id: p.id,
      title: p.title,
      price: (p.priceCents/100).toFixed(2),
      durationMin: p.durationMin,
      tier: p.tier,
      category: p.category,
    }));

    return NextResponse.json({
      message: completion.choices[0]?.message?.content ?? "",
      recommendations: recs,
      citations: ranked.map((r) => ({ type: r.type, title: r.title, id: r.sourceId })),
      casesPreview: cases.slice(0, 3).map((c) => ({ id: c.id, title: c.title, summary: c.summary })),
    });
  } catch (err: unknown) {
    // Log for server-side visibility during development
    console.error("/api/ai/chat error", err);
    const anyErr = err as { status?: number; error?: { message?: string; type?: string; code?: string } };
    const code = anyErr?.error?.code || "unknown_error";
    const message = anyErr?.error?.message || (err instanceof Error ? err.message : "Service unavailable");
    const status = (() => {
      switch (code) {
        case "insufficient_quota":
        case "rate_limit_exceeded":
          return 429;
        case "invalid_api_key":
          return 401;
        case "model_not_found":
        case "permission_denied":
          return 403;
        case "request_timeout":
          return 504;
        default:
          return anyErr?.status || 502;
      }
    })();
    return NextResponse.json({ error: code, message }, { status });
  }
}


