import { prisma } from "@/app/lib/prisma";
import { getSessionPatientId } from "@/app/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PortalPrescriptions() {
  const patientId = await getSessionPatientId();
  if (!patientId) redirect("/");

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true, name: true, email: true },
  });

  if (!patient) redirect("/");

  const now = new Date();
  const threeMonths = new Date(now);
  threeMonths.setMonth(threeMonths.getMonth() + 3);

  const rxs = await prisma.prescription.findMany({
    where: { patientId, refillOn: { gte: now, lte: threeMonths } },
    orderBy: { refillOn: "asc" },
  });

  const sevenDays = new Date(now);
  sevenDays.setDate(sevenDays.getDate() + 7);
  const next7 = rxs.filter((p) => new Date(p.refillOn) <= sevenDays);

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>Prescriptions</h1>
      <div style={{ opacity: 0.85, marginBottom: 12 }}>
        {patient.name}, {patient.email}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, padding: "8px 12px" }}>Total: {rxs.length}</div>
        <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, padding: "8px 12px" }}>
          Refills next 7 days: {next7.length}
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {rxs.map((p) => (
          <div key={p.id} style={{ border: "1px solid rgba(255,255,255,0.10)", borderRadius: 14, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  {p.medication} {p.dosage}
                </div>
                <div style={{ opacity: 0.8 }}>
                  Qty: {p.quantity} | Schedule: {p.refillSchedule}
                </div>
              </div>
              <div style={{ opacity: 0.9 }}>Refill: {new Date(p.refillOn).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
        {!rxs.length ? <div style={{ opacity: 0.8 }}>No upcoming refills (next 3 months)</div> : null}
      </div>
    </main>
  );
}
