"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Patient = {
  id: number;
  name: string;
  email: string;
};

type Appointment = {
  id: number;
  provider: string;
  startAt: string;
  repeat: "none" | "weekly" | "monthly";
  repeatUntil: string | null;
};

type Prescription = {
  id: number;
  medication: string;
  dosage: string;
  quantity: number;
  refillOn: string;
  refillSchedule: "none" | "weekly" | "monthly";
};

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function AdminPatientDetailClient(props: {
  patient: Patient;
  appointments: Appointment[];
  prescriptions: Prescription[];
}) {
  const router = useRouter();
  const patientId = props.patient.id;

  /* ---------------- PATIENT ---------------- */

  const [name, setName] = useState(props.patient.name);
  const [email, setEmail] = useState(props.patient.email);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function savePatient() {
    setSaving(true);
    try {
      const payload: any = { name, email };
      if (password.trim().length >= 6) {
        payload.password = password.trim();
      }

      const res = await fetch(`/api/admin/patients/${patientId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error);

      setPassword("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  /* ---------------- APPOINTMENTS ---------------- */

  const [provider, setProvider] = useState("Dr Lin James");
  const [startAt, setStartAt] = useState("");
  const [repeat, setRepeat] = useState<"none" | "weekly" | "monthly">("none");
  const [repeatUntil, setRepeatUntil] = useState("");

  async function addAppointment() {
    if (!startAt) {
      alert("Start date/time is required");
      return;
    }

    const res = await fetch(
      `/api/admin/patients/${patientId}/appointments`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          provider,
          startAt,
          repeat,
          repeatUntil: repeatUntil || null,
        }),
      }
    );

    const json = await res.json();
    if (!json.ok) throw new Error(json.error);

    setStartAt("");
    setRepeat("none");
    setRepeatUntil("");
    router.refresh();
  }

  async function deleteAppointment(id: number) {
    const res = await fetch(`/api/admin/appointments/${id}`, {
      method: "DELETE",
    });

    const json = await res.json();
    if (!json.ok) throw new Error(json.error);

    router.refresh();
  }

  /* ---------------- PRESCRIPTIONS ---------------- */

  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [refillOn, setRefillOn] = useState("");
  const [schedule, setSchedule] =
    useState<"none" | "weekly" | "monthly">("monthly");

  async function addPrescription() {
    if (!medication || !dosage || !refillOn) {
      alert("Medication, dosage, and refill date are required");
      return;
    }

    const res = await fetch(
      `/api/admin/patients/${patientId}/prescriptions`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          medication,
          dosage,
          quantity,
          refillOn,
          refillSchedule: schedule,
        }),
      }
    );

    const json = await res.json();
    if (!json.ok) throw new Error(json.error);

    setMedication("");
    setDosage("");
    setQuantity(1);
    setRefillOn("");
    router.refresh();
  }

  async function deletePrescription(id: number) {
    const res = await fetch(`/api/admin/prescriptions/${id}`, {
      method: "DELETE",
    });

    const json = await res.json();
    if (!json.ok) throw new Error(json.error);

    router.refresh();
  }

  /* ---------------- UI ---------------- */

  return (
    <div style={{ display: "grid", gap: 24 }}>

      <section>
        <h2>Patient</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          placeholder="New password (optional)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={savePatient} disabled={saving}>
          {saving ? "Saving..." : "Save patient"}
        </button>
      </section>

      <section>
        <h2>Appointments</h2>
        <input value={provider} onChange={(e) => setProvider(e.target.value)} />
        <input
          type="datetime-local"
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
        />
        <select value={repeat} onChange={(e) => setRepeat(e.target.value as any)}>
          <option value="none">none</option>
          <option value="weekly">weekly</option>
          <option value="monthly">monthly</option>
        </select>
        <input
          type="date"
          value={repeatUntil}
          onChange={(e) => setRepeatUntil(e.target.value)}
        />
        <button onClick={addAppointment}>Add</button>

        {props.appointments.map((a) => (
          <div key={a.id}>
            {a.provider} – {formatDate(a.startAt)}
            <button onClick={() => deleteAppointment(a.id)}>Delete</button>
          </div>
        ))}
      </section>

      <section>
        <h2>Prescriptions</h2>
        <input
          placeholder="Medication"
          value={medication}
          onChange={(e) => setMedication(e.target.value)}
        />
        <input
          placeholder="Dosage"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
        />
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <input
          type="date"
          value={refillOn}
          onChange={(e) => setRefillOn(e.target.value)}
        />
        <select
          value={schedule}
          onChange={(e) => setSchedule(e.target.value as any)}
        >
          <option value="none">none</option>
          <option value="weekly">weekly</option>
          <option value="monthly">monthly</option>
        </select>
        <button onClick={addPrescription}>Add</button>

        {props.prescriptions.map((p) => (
          <div key={p.id}>
            {p.medication} {p.dosage} – Qty {p.quantity}
            <button onClick={() => deletePrescription(p.id)}>Delete</button>
          </div>
        ))}
      </section>

    </div>
  );
}
