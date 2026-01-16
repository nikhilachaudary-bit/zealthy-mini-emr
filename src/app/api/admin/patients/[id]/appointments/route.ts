import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { RepeatSchedule } from "@prisma/client";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const patientId = Number(id);
  if (!patientId) return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });

  const body = (await req.json()) as {
    provider?: string;
    startAt?: string;
    repeat?: "none" | "weekly" | "monthly";
    repeatUntil?: string | null;
  };

  const provider = (body.provider ?? "").trim();
  const startAt = body.startAt ? new Date(body.startAt) : null;
  const repeat = body.repeat ?? "none";
  const repeatUntil = body.repeatUntil ? new Date(body.repeatUntil) : null;

  if (!provider || !startAt || Number.isNaN(startAt.getTime())) {
    return NextResponse.json({ ok: false, error: "Invalid appointment" }, { status: 400 });
  }

  const created = await prisma.appointment.create({
    data: {
      patientId,
      provider,
      startAt,
      repeat:
        repeat === "weekly" ? RepeatSchedule.weekly : repeat === "monthly" ? RepeatSchedule.monthly : RepeatSchedule.none,
      repeatUntil,
    },
  });

  return NextResponse.json({ ok: true, appointment: created });
}
