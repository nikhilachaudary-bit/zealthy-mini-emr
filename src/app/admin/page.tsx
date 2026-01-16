import Link from "next/link";
import { prisma } from "@/lib/prisma";


export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const patients = await prisma.patient.findMany({
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Mini EMR</h1>
        <Link href="/admin/patients/new" style={{ textDecoration: "none" }}>
          New patient
        </Link>
      </div>

      <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 140px 140px 120px", gap: 0, padding: 12, opacity: 0.85 }}>
          <div>ID</div>
          <div>Name</div>
          <div>Email</div>
          <div>Appointments</div>
          <div>Prescriptions</div>
          <div>Open</div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }} />
        {patients.map((p) => (
          <div
            key={p.id}
            style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr 1fr 140px 140px 120px",
              padding: 12,
              borderTop: "1px solid rgba(255,255,255,0.08)",
              alignItems: "center",
            }}
          >
            <div>{p.id}</div>
            <div>{p.name}</div>
            <div>{p.email}</div>
            <div>{p.appointments.length}</div>
            <div>{p.prescriptions.length}</div>
            <div>
              <Link href={`/admin/patients/${p.id}`} style={{ textDecoration: "none" }}>
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
