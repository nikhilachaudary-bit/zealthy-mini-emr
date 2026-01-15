import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { RefillSchedule } from "@prisma/client";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const patientId = Number(id);
  if (!patientId) return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });

  const body = (await req.json()) as {
    medication?: string;
    dosage?: string;
    quantity?: number;
    refillOn?: string;
    refillSchedule?: "none" | "weekly" | "monthly";
  };

  const medication = (body.medication ?? "").trim();
  const dosage = (body.dosage ?? "").trim();
  const quantity = Number(body.quantity ?? 0);
  const refillOn = body.refillOn ? new Date(body.refillOn) : null;
  const refillSchedule = body.refillSchedule ?? "none";

  if (!medication || !dosage || !refillOn || Number.isNaN(refillOn.getTime()) || quantity <= 0) {
    return NextResponse.json({ ok: false, error: "Invalid prescription" }, { status: 400 });
  }

  const created = await prisma.prescription.create({
    data: {
      patientId,
      medication,
      dosage,
      quantity,
      refillOn,
      refillSchedule:
        refillSchedule === "weekly"
          ? RefillSchedule.weekly
          : refillSchedule === "monthly"
          ? RefillSchedule.monthly
          : RefillSchedule.none,
    },
  });

  return NextResponse.json({ ok: true, prescription: created });
}
