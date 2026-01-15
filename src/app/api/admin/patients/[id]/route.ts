import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const patientId = Number(id);
  if (!patientId) return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
  });

  if (!patient) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, patient });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const patientId = Number(id);
    if (!patientId) return NextResponse.json({ ok: false, error: "Bad id" }, { status: 400 });

    const body = (await req.json()) as { name?: string; email?: string; password?: string };
    const data: any = {};

    if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
    if (typeof body.email === "string" && body.email.trim()) data.email = body.email.trim().toLowerCase();
    if (typeof body.password === "string" && body.password.length >= 6) {
      data.passwordHash = await bcrypt.hash(body.password, 10);
    }

    const patient = await prisma.patient.update({
      where: { id: patientId },
      data,
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ ok: true, patient });
  } catch (e: any) {
    const msg = typeof e?.message === "string" ? e.message : "Update failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
