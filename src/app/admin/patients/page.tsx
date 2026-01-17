import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPatientsPage() {
  const patients = await prisma.patient.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Patients</h1>
        <Link href="/admin/patients/new">➕ New Patient</Link>
      </div>

      {patients.length === 0 ? (
        <p style={{ opacity: 0.7 }}>No patients found.</p>
      ) : (
        <ul style={{ marginTop: 20, display: "grid", gap: 12 }}>
          {patients.map((p) => (
            <li
              key={p.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 14, opacity: 0.7 }}>{p.email}</div>
              </div>

              <Link href={`/admin/patients/${p.id}`}>View</Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
