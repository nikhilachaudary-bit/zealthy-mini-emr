import { addDays, addMonths, isAfter, isBefore } from "date-fns";

type Repeat = "none" | "weekly" | "monthly";

export function expandAppointments(
  base: Array<{
    id: number;
    provider: string;
    startAt: Date;
    repeat: Repeat;
    repeatUntil: Date | null;
  }>,
  horizonEnd: Date
) {
  const out: Array<{ seriesId: number; provider: string; at: Date }> = [];
  for (const a of base) {
    let cursor = new Date(a.startAt);
    const until = a.repeatUntil ?? horizonEnd;

    while (isBefore(cursor, horizonEnd) || cursor.getTime() === horizonEnd.getTime()) {
      if (isAfter(cursor, until)) break;
      out.push({ seriesId: a.id, provider: a.provider, at: new Date(cursor) });

      if (a.repeat === "none") break;
      cursor = a.repeat === "weekly" ? addDays(cursor, 7) : addMonths(cursor, 1);
    }
  }

  out.sort((x, y) => x.at.getTime() - y.at.getTime());
  return out;
}

export function isWithinNextDays(d: Date, days: number) {
  const now = new Date();
  const end = new Date();
  end.setDate(now.getDate() + days);
  return d >= now && d <= end;
}
