import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function requireAdmin(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const isAdmin = cookieStore.get("admin")?.value === "1";
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET() {
  const cookieStore = await cookies();
  const unauth = requireAdmin(cookieStore);
  if (unauth) return unauth;
  const [rules, recurring, blocks] = await Promise.all([
    prisma.availabilityRule.findMany({ orderBy: { weekday: "asc" } }),
    prisma.recurringBlock.findMany({ orderBy: { weekday: "asc" } }),
    prisma.timeBlock.findMany({ orderBy: { start: "asc" } }),
  ]);
  return NextResponse.json({ rules, recurring, blocks });
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const unauth = requireAdmin(cookieStore);
  if (unauth) return unauth;
  const body = await req.json().catch(() => ({}));
  const { action } = body || {};
  switch (action) {
    case "create_rule": {
      const { weekday, startMinutes, endMinutes, isActive = true } = body;
      const rule = await prisma.availabilityRule.create({ data: { weekday, startMinutes, endMinutes, isActive } });
      return NextResponse.json({ rule });
    }
    case "replace_rules": {
      const { weekdays, startMinutes, endMinutes, isActive = true } = body as { weekdays: number[]; startMinutes: number; endMinutes: number; isActive?: boolean };
      if (!Array.isArray(weekdays) || weekdays.length === 0) {
        return NextResponse.json({ error: "weekdays required" }, { status: 400 });
      }
      await prisma.$transaction([
        prisma.availabilityRule.deleteMany({ where: { weekday: { in: weekdays } } }),
        prisma.availabilityRule.createMany({ data: weekdays.map((wd)=> ({ weekday: wd, startMinutes, endMinutes, isActive })) }),
      ]);
      const rules = await prisma.availabilityRule.findMany({ orderBy: { weekday: "asc" } });
      return NextResponse.json({ rules });
    }
    case "update_rule": {
      const { id, weekday, startMinutes, endMinutes, isActive } = body;
      const rule = await prisma.availabilityRule.update({ where: { id }, data: { weekday, startMinutes, endMinutes, isActive } });
      return NextResponse.json({ rule });
    }
    case "delete_rule": {
      const { id } = body;
      await prisma.availabilityRule.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }
    case "create_rules": {
      const { rules } = body as { rules: Array<{ weekday: number; startMinutes: number; endMinutes: number; isActive?: boolean }> };
      if (!Array.isArray(rules) || rules.length === 0) {
        return NextResponse.json({ error: "rules required" }, { status: 400 });
      }
      await prisma.availabilityRule.createMany({
        data: rules.map((r) => ({
          weekday: Number(r.weekday),
          startMinutes: Number(r.startMinutes),
          endMinutes: Number(r.endMinutes),
          isActive: r.isActive === undefined ? true : Boolean(r.isActive),
        })),
      });
      const all = await prisma.availabilityRule.findMany({ orderBy: { weekday: "asc" } });
      return NextResponse.json({ rules: all });
    }
    case "set_weekly": {
      // Replace all availability with the provided weekly structure
      const { weekly } = body as { weekly: Record<string, Array<{ startMinutes: number; endMinutes: number }>> };
      if (!weekly || typeof weekly !== 'object') return NextResponse.json({ error: 'weekly required' }, { status: 400 });
      const days = [0,1,2,3,4,5,6];
      const tx: Parameters<typeof prisma.$transaction>[0] = [] as any;
      tx.push(prisma.availabilityRule.deleteMany({}));
      for (const wd of days) {
        const blocks = weekly[String(wd)] || [];
        for (const b of blocks) {
          tx.push(prisma.availabilityRule.create({ data: { weekday: wd, startMinutes: Number(b.startMinutes), endMinutes: Number(b.endMinutes), isActive: true } }));
        }
      }
      await prisma.$transaction(tx);
      const after = await prisma.availabilityRule.findMany({ orderBy: { weekday: 'asc' } });
      return NextResponse.json({ rules: after });
    }
    case "create_recurring": {
      const { weekday, startMinutes, endMinutes, startsOn, endsOn, reason } = body;
      const rb = await prisma.recurringBlock.create({ data: { weekday, startMinutes, endMinutes, startsOn: startsOn ? new Date(startsOn) : undefined, endsOn: endsOn ? new Date(endsOn) : null, reason } });
      return NextResponse.json({ recurring: rb });
    }
    case "update_recurring": {
      const { id, weekday, startMinutes, endMinutes, startsOn, endsOn, reason } = body;
      const rb = await prisma.recurringBlock.update({ where: { id }, data: { weekday, startMinutes, endMinutes, startsOn: startsOn ? new Date(startsOn) : undefined, endsOn: typeof endsOn === 'string' ? new Date(endsOn) : endsOn, reason } });
      return NextResponse.json({ recurring: rb });
    }
    case "delete_recurring": {
      const { id } = body;
      await prisma.recurringBlock.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }
    case "create_block": {
      const { start, end, reason } = body;
      const tb = await prisma.timeBlock.create({ data: { start: new Date(start), end: new Date(end), reason } });
      return NextResponse.json({ block: tb });
    }
    case "delete_block": {
      const { id } = body;
      await prisma.timeBlock.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }
    case "delete_weekday_rules": {
      const { weekday } = body as { weekday: number };
      if (typeof weekday !== 'number') return NextResponse.json({ error: "weekday required" }, { status: 400 });
      await prisma.availabilityRule.deleteMany({ where: { weekday } });
      return NextResponse.json({ ok: true });
    }
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}


