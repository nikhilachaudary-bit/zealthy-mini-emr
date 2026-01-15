import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import AdminPatientDetailClient from "@/app/admin/patients/[id]/patientDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminPatientDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const patientId = Number(id);

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true, name: true, email: true },
  });

  if (!patient) {
    return (
      <main style={{ padding: 24 }}>
        <div>Patient not found</div>
        <Link href="/admin">Back</Link>
      </main>
    );
  }

  const now = new Date();
  const threeMonths = new Date(now);
  threeMonths.setMonth(threeMonths.getMonth() + 3);

  const appointments = await prisma.appointment.findMany({
    where: { patientId, startAt: { gte: now, lte: threeMonths } },
    orderBy: { startAt: "asc" },
  });

  const prescriptions = await prisma.prescription.findMany({
    where: { patientId, refillOn: { gte: now, lte: threeMonths } },
    orderBy: { refillOn: "asc" },
  });

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0 }}>Patient</h1>
          <div style={{ opacity: 0.85, marginTop: 6 }}>
            {patient.name}, {patient.email}
          </div>
        </div>
        <Link href="/admin" style={{ textDecoration: "none" }}>
          Back
        </Link>
      </div>

      <AdminPatientDetailClient patient={patient} appointments={appointments} prescriptions={prescriptions} />
    </main>
  );
}
