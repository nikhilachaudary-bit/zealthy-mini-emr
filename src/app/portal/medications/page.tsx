import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPatientIdFromCookie } from "@/app/lib/getPatientIdFromCookie";

export default async function PortalMedications() {
  const patientId = await getPatientIdFromCookie();
  if (!patientId) redirect("/");

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { name: true, email: true },
  });

  if (!patient) redirect("/");

  const meds = await prisma.medicationOption.findMany({
    orderBy: { name: "asc" },
  });

  const dosages = await prisma.dosageOption.findMany({
    orderBy: { value: "asc" },
  });

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0 }}>Medications</h1>
          <div style={{ opacity: 0.8, marginTop: 6 }}>
            {patient.name}, {patient.email}
          </div>
        </div>
        <Link href="/portal">Back</Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
          marginTop: 18,
        }}
      >
        <section style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>Medication options</h2>
          <ul style={{ marginTop: 12 }}>
            {meds.map((m) => (
              <li key={m.id}>{m.name}</li>
            ))}
          </ul>
        </section>

        <section style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>Dosage options</h2>
          <ul style={{ marginTop: 12 }}>
            {dosages.map((d) => (
              <li key={d.id}>{d.value}</li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
