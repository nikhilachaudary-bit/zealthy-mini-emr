import { prisma } from "@/app/lib/prisma";
import { getSessionPatientId } from "@/app/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PortalAppointments() {
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

  const appts = await prisma.appointment.findMany({
    where: { patientId, startAt: { gte: now, lte: threeMonths } },
    orderBy: { startAt: "asc" },
  });

  const sevenDays = new Date(now);
  sevenDays.setDate(sevenDays.getDate() + 7);
  const next7 = appts.filter((a) => new Date(a.startAt) <= sevenDays);

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>Appointments</h1>
      <div style={{ opacity: 0.85, marginBottom: 12 }}>
        {patient.name}, {patient.email}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, padding: "8px 12px" }}>Total: {appts.length}</div>
        <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, padding: "8px 12px" }}>
          Next 7 days: {next7.length}
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {appts.map((a) => (
          <div key={a.id} style={{ border: "1px solid rgba(255,255,255,0.10)", borderRadius: 14, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{a.provider}</div>
                <div style={{ opacity: 0.8 }}>Repeat: {a.repeat}</div>
              </div>
              <div style={{ opacity: 0.9 }}>{new Date(a.startAt).toLocaleString()}</div>
            </div>
          </div>
        ))}
        {!appts.length ? <div style={{ opacity: 0.8 }}>No upcoming appointments (next 3 months)</div> : null}
      </div>
    </main>
  );
}
