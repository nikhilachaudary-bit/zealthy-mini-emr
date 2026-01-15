import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import { setSessionPatientId } from "@/app/lib/session";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "Missing email or password" }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({ where: { email } });
    if (!patient) {
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, patient.passwordHash);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }

    await setSessionPatientId(patient.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Login failed" }, { status: 500 });
  }
}
