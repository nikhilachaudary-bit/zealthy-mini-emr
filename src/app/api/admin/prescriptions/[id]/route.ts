import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { RefillSchedule } from "@prisma/client";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const rxId = Number(id);
  if (!rxId) return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });

  const body = (await req.json()) as {
    medication?: string;
    dosage?: string;
    quantity?: number;
    refillOn?: string;
    refillSchedule?: "none" | "weekly" | "monthly";
  };

  const data: any = {};
  if (typeof body.medication === "string" && body.medication.trim()) data.medication = body.medication.trim();
  if (typeof body.dosage === "string" && body.dosage.trim()) data.dosage = body.dosage.trim();
  if (typeof body.quantity === "number" && body.quantity > 0) data.quantity = body.quantity;
  if (typeof body.refillOn === "string") {
    const d = new Date(body.refillOn);
    if (!Number.isNaN(d.getTime())) data.refillOn = d;
  }
  if (typeof body.refillSchedule === "string") {
    data.refillSchedule =
      body.refillSchedule === "weekly"
        ? RefillSchedule.weekly
        : body.refillSchedule === "monthly"
        ? RefillSchedule.monthly
        : RefillSchedule.none;
  }

  const updated = await prisma.prescription.update({ where: { id: rxId }, data });
  return NextResponse.json({ ok: true, prescription: updated });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const rxId = Number(id);
  if (!rxId) return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });

  await prisma.prescription.delete({ where: { id: rxId } });
  return NextResponse.json({ ok: true });
}
