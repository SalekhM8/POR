import { NextResponse } from "next/server";
import { PrismaClient, BookingStatus } from "@prisma/client";

const prisma = new PrismaClient();

const SLOT_INTERVAL_MIN = 15; // granularity
const BUFFER_MIN = 15; // gap between bookings

function toMinutes(date: Date): number {
  // Interpret minutes within the local timezone day for user-facing correctness
  return date.getHours() * 60 + date.getMinutes();
}

function fromMinutes(day: Date, minutes: number): Date {
  // Build a local Date at the given minutes offset from midnight of 'day'
  const d = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
  d.setMinutes(minutes);
  return d;
}

function overlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function subtractIntervals(base: Array<[number, number]>, blocks: Array<[number, number]>): Array<[number, number]> {
  // For each base interval, subtract all blocks
  let result = [...base];
  for (const [bs, be] of blocks) {
    const next: Array<[number, number]> = [];
    for (const [s, e] of result) {
      if (!overlap(s, e, bs, be)) { next.push([s, e]); continue; }
      if (bs <= s && be >= e) {
        // fully covered, drop
      } else if (bs <= s && be < e) {
        next.push([be, e]);
      } else if (bs > s && be >= e) {
        next.push([s, bs]);
      } else {
        // split into two
        next.push([s, bs]);
        next.push([be, e]);
      }
    }
    result = next;
  }
  return result.filter(([s, e]) => e - s >= SLOT_INTERVAL_MIN);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date"); // YYYY-MM-DD
    const packageId = searchParams.get("packageId");
    if (!dateStr || !packageId) {
      return NextResponse.json({ error: "Missing date or packageId" }, { status: 400 });
    }
    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) return NextResponse.json({ error: "Unknown package" }, { status: 404 });

    // Parse day as UTC midnight
    // Use local midnight for the chosen date to avoid TZ drift in UI
    const [y,m,d] = dateStr.split('-').map((n)=>Number(n));
    const day = new Date(y, (m-1), d, 0, 0, 0, 0);
    if (isNaN(day.getTime())) return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    const weekday = day.getDay(); // 0..6 local
    const dayStart = new Date(day);
    const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1, 0, 0, 0, 0);

    // Availability rules for this weekday
    const rules = await prisma.availabilityRule.findMany({ where: { weekday, isActive: true }, orderBy: { startMinutes: "asc" } });
    // Explicit-only behavior: if no rules for this weekday, the day is closed (no base hours)
    let free: Array<[number, number]> = rules.length > 0
      ? rules.map(r => [r.startMinutes, r.endMinutes])
      : [];

    // Recurring blocks for this weekday and effective date range
    const recurring = await prisma.recurringBlock.findMany({
      where: {
        weekday,
        startsOn: { lte: dayEnd },
        OR: [{ endsOn: null }, { endsOn: { gte: dayStart } }],
      },
    });
    const recurringBlocks: Array<[number, number]> = recurring.map(b => [b.startMinutes, b.endMinutes]);

    // Absolute time blocks intersecting the day
    const blocks = await prisma.timeBlock.findMany({
      where: {
        OR: [
          { start: { gte: dayStart, lt: dayEnd } },
          { end: { gt: dayStart, lte: dayEnd } },
          { start: { lt: dayStart }, end: { gt: dayEnd } },
        ],
      },
    });
    const absBlocks: Array<[number, number]> = blocks.map(b => [toMinutes(b.start), toMinutes(b.end)]);

    // Subtract recurring and absolute blocks from free intervals
    free = subtractIntervals(free, [...recurringBlocks, ...absBlocks]);

    // Existing bookings for the day (with buffers)
    const bookings = await prisma.booking.findMany({
      where: {
        status: { in: [BookingStatus.pending, BookingStatus.confirmed] },
        startTime: { lt: dayEnd },
        endTime: { gt: dayStart },
      },
      select: { startTime: true, endTime: true },
    });
    const booked: Array<[number, number]> = bookings
      .filter(b => b.startTime && b.endTime)
      .map(b => [toMinutes(b.startTime as Date), toMinutes(b.endTime as Date) + BUFFER_MIN]);

    // Compute candidate start times in SLOT_INTERVAL_MIN steps
    const duration = pkg.durationMin;
    const candidates: Date[] = [];
    const now = new Date();
    for (const [s, e] of free) {
      for (let m = s; m + duration + BUFFER_MIN <= e; m += SLOT_INTERVAL_MIN) {
        const start = fromMinutes(day, m);
        const end = fromMinutes(day, m + duration);
        // filter out past times (same-day)
        if (start < now && day.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)) continue;
        // ensure no overlap with bookings (consider buffer after end)
        const sm = m;
        const em = m + duration + BUFFER_MIN;
        const conflict = booked.some(([bs, be]) => overlap(sm, em, bs, be));
        if (!conflict) candidates.push(start);
      }
    }

    function hhmm(date: Date) { const h = String(date.getHours()).padStart(2,'0'); const m = String(date.getMinutes()).padStart(2,'0'); return `${h}:${m}`; }
    return NextResponse.json({
      slots: candidates.map(d => ({
        start: d.toISOString(),
        label: hhmm(d), // display in local time consistently
      })),
      bufferMin: BUFFER_MIN,
      intervalMin: SLOT_INTERVAL_MIN,
      durationMin: duration,
    });
  } catch (e) {
    console.error("/api/availability error", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}


