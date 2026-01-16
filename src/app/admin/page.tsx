import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PatientRow = {
  id: number;
  name: string;
  email: string;
  appointments: { id: number }[];
  prescriptions: { id: number }[];
};

export default async function AdminHome() {
  const patients: PatientRow[] = await prisma.patient.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      appointments: { select: { id: true } },
      prescriptions: { select: { id: true } },
    },
  });

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Admin</h1>
        <Link href="/admin/patients/new">New patient</Link>
      </div>

      <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
        {patients.map((p) => (
          <Link
            key={p.id}
            href={`/admin/patients/${p.id}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: 16,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.15)",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ opacity: 0.8 }}>{p.email}</div>
            </div>

            <div style={{ display: "flex", gap: 16, alignItems: "center", opacity: 0.85 }}>
              <div>Appointments: {p.appointments.length}</div>
              <div>Prescriptions: {p.prescriptions.length}</div>
            </div>
          </Link>
        ))}

        {!patients.length && (
          <div style={{ opacity: 0.7, marginTop: 32 }}>
            No patients yet.
          </div>
        )}
      </div>
    </main>
  );
}
