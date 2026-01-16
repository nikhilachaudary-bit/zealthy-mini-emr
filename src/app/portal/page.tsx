// src/app/portal/page.tsx
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma";
import { getPatientIdFromCookie } from "@/app/lib/getPatientIdFromCookie"

function fmt(dt: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dt)
}

export default async function PortalHome() {
  const patientId = await getPatientIdFromCookie()
  if (!patientId) redirect("/")

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true, name: true, email: true },
  })

  if (!patient) redirect("/")

  const nextAppt = await prisma.appointment.findFirst({
    where: { patientId },
    orderBy: { startAt: "asc" },
  })

  const nextRefill = await prisma.prescription.findFirst({
    where: { patientId },
    orderBy: { refillOn: "asc" },
  })

  const apptCount = await prisma.appointment.count({ where: { patientId } })
  const rxCount = await prisma.prescription.count({ where: { patientId } })

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0 }}>Summary</h1>
        <div style={{ opacity: 0.8, marginTop: 6 }}>
          {patient.name}, {patient.email}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 14,
        }}
      >
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 14,
            padding: 14,
          }}
        >
          <div style={{ opacity: 0.8, marginBottom: 6 }}>Appointments</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{apptCount}</div>
          <div style={{ opacity: 0.85, marginTop: 10 }}>
            Next: {nextAppt ? `${nextAppt.provider} on ${fmt(nextAppt.startAt as unknown as Date)}` : "None"}
          </div>
        </div>

        <div
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 14,
            padding: 14,
          }}
        >
          <div style={{ opacity: 0.8, marginBottom: 6 }}>Prescriptions</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{rxCount}</div>
          <div style={{ opacity: 0.85, marginTop: 10 }}>
            Next refill:{" "}
            {nextRefill ? `${nextRefill.medication} on ${fmt(nextRefill.refillOn as unknown as Date)}` : "None"}
          </div>
        </div>
      </div>
    </main>
  )
}
