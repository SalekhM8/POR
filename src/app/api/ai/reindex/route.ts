import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient, Prisma } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function chunkText(input: string, maxLen = 1200): string[] {
  const parts: string[] = [];
  const sentences = input.split(/(?<=[.!?])\s+/);
  let buf = "";
  for (const s of sentences) {
    if ((buf + " " + s).trim().length > maxLen) {
      if (buf) parts.push(buf.trim());
      buf = s;
    } else {
      buf = (buf ? buf + " " : "") + s;
    }
  }
  if (buf) parts.push(buf.trim());
  return parts.length > 0 ? parts : [input.slice(0, maxLen)];
}

export async function POST() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin")?.value === "1";
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });

  const packages = await prisma.package.findMany();
  const cases = await prisma.caseStudy.findMany();

  // Clear existing chunks to keep index fresh
  await prisma.aIChunk.deleteMany();

  const toEmbed: { type: "package" | "case"; sourceId: string; title: string; content: string; metadata?: Prisma.InputJsonValue }[] = [];
  for (const p of packages) {
    const base = `${p.title}\n\n${p.description}\n\nFeatures: ${(Array.isArray(p.features) ? p.features : []).join(", ")}\nTier: ${p.tier ?? ""}\nCategory: ${p.category ?? ""}\nPrice(£): ${(p.priceCents/100).toFixed(2)}\nDuration(min): ${p.durationMin}`;
    for (const chunk of chunkText(base)) {
      toEmbed.push({ type: "package", sourceId: p.id, title: p.title, content: chunk, metadata: { priceCents: p.priceCents, durationMin: p.durationMin, tier: p.tier, category: p.category } });
    }
  }
  for (const c of cases) {
    const base = `${c.title}\n\n${c.summary}\n\n${c.content}`;
    for (const chunk of chunkText(base)) {
      toEmbed.push({ type: "case", sourceId: c.id, title: c.title, content: chunk, metadata: { tags: c.tags } });
    }
  }

  // Batch embeddings to avoid large payloads
  const embeddings: Array<{ embedding: number[]; idx: number }> = [];
  const BATCH = 64;
  for (let i = 0; i < toEmbed.length; i += BATCH) {
    const batch = toEmbed.slice(i, i + BATCH);
    const text = batch.map((b) => b.content);
    const res = await openai.embeddings.create({ model: "text-embedding-3-small", input: text });
    res.data.forEach((row, j) => embeddings.push({ embedding: row.embedding as unknown as number[], idx: i + j }));
  }

  const records: Prisma.AIChunkCreateManyInput[] = embeddings.map((e) => {
    const src = toEmbed[e.idx];
    return {
      type: src.type,
      sourceId: src.sourceId,
      title: src.title,
      content: src.content,
      metadata: (src.metadata ?? {}) as Prisma.InputJsonValue,
      embedding: (e.embedding as unknown as number[]) as unknown as Prisma.InputJsonValue,
    };
  });

  // Insert in chunks to avoid query size limits
  for (let i = 0; i < records.length; i += 100) {
    await prisma.aIChunk.createMany({ data: records.slice(i, i + 100) });
  }

  const count = await prisma.aIChunk.count();
  return NextResponse.json({ ok: true, chunks: count });
}


