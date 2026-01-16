import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { getSessionPatientId } from "@/app/lib/session";

export async function GET() {
  const patientId = await getSessionPatientId();
  if (!patientId) return NextResponse.json({ ok: true, patient: null });

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json({ ok: true, patient });
}
