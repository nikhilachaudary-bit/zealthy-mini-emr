import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { RepeatSchedule } from "@prisma/client";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const apptId = Number(id);
  if (!apptId) return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });

  const body = (await req.json()) as {
    provider?: string;
    startAt?: string;
    repeat?: "none" | "weekly" | "monthly";
    repeatUntil?: string | null;
  };

  const data: any = {};
  if (typeof body.provider === "string" && body.provider.trim()) data.provider = body.provider.trim();
  if (typeof body.startAt === "string") {
    const d = new Date(body.startAt);
    if (!Number.isNaN(d.getTime())) data.startAt = d;
  }
  if (typeof body.repeat === "string") {
    data.repeat =
      body.repeat === "weekly" ? RepeatSchedule.weekly : body.repeat === "monthly" ? RepeatSchedule.monthly : RepeatSchedule.none;
  }
  if (body.repeatUntil === null) data.repeatUntil = null;
  if (typeof body.repeatUntil === "string") {
    const d = new Date(body.repeatUntil);
    if (!Number.isNaN(d.getTime())) data.repeatUntil = d;
  }

  const updated = await prisma.appointment.update({ where: { id: apptId }, data });
  return NextResponse.json({ ok: true, appointment: updated });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const apptId = Number(id);
  if (!apptId) return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });

  await prisma.appointment.delete({ where: { id: apptId } });
  return NextResponse.json({ ok: true });
}
