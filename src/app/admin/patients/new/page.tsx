import AdminPatientForm from "@/app/admin/patients/new/patientForm";

export const dynamic = "force-dynamic";

export default function NewPatientPage() {
  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>New patient</h1>
      <AdminPatientForm />
    </main>
  );
}
