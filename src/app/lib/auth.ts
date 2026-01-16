// src/app/lib/auth.ts
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

import { getPatientIdFromCookie } from "@/app/lib/getPatientIdFromCookie";

export async function requirePatient() {
  const patientId = await getPatientIdFromCookie();
  if (!patientId) redirect("/");

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true, name: true, email: true },
  });

  if (!patient) redirect("/");

  return patient;
}
