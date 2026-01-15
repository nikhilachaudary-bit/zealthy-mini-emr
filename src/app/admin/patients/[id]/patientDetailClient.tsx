"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Patient = { id: number; name: string; email: string };
type Appointment = {
  id: number;
  patientId: number;
  provider: string;
  startAt: string | Date;
  repeat: "none" | "weekly" | "monthly";
  repeatUntil: string | Date | null;
};
type Prescription = {
  id: number;
  patientId: number;
  medication: string;
  dosage: string;
  quantity: number;
  refillOn: string | Date;
  refillSchedule: "none" | "weekly" | "monthly";
};

function fmt(dt: string | Date) {
  const d = typeof dt === "string" ? new Date(dt) : dt;
  return d.toLocaleString();
}

export default function AdminPatientDetailClient(props: {
  patient: Patient;
  appointments: Appointment[];
  prescriptions: Prescription[];
}) {
  const router = useRouter();
  const patientId = props.patient.id;

  const [editName, setEditName] = useState(props.patient.name);
  const [editEmail, setEditEmail] = useState(props.patient.email);
  const [newPassword, setNewPassword] = useState("");
  const [savingPatient, setSavingPatient] = useState(false);

  const [apptProvider, setApptProvider] = useState("Dr Lin James");
  const [apptStartAt, setApptStartAt] = useState("");
  const [apptRepeat, setApptRepeat] = useState<"none" | "weekly" | "monthly">("none");
  const [apptRepeatUntil, setApptRepeatUntil] = useState("");

  const [rxMedication, setRxMedication] = useState("");
  const [rxDosage, setRxDosage] = useState("");
  const [rxQty, setRxQty] = useState(1);
  const [rxRefillOn, setRxRefillOn] = useState("");
  const [rxSchedule, setRxSchedule] = useState<"none" | "weekly" | "monthly">("monthly");

  const [options, setOptions] = useState<{ name: string; dosages: string[] }[] | null>(null);
  const medicationNames = useMemo(() => options?.map((m) => m.name) ?? [], [options]);
  const dosageOptions = useMemo(() => {
    if (!options) return [];
    const m = options.find((x) => x.name === rxMedication);
    return m?.dosages ?? [];
  }, [options, rxMedication]);

  async function loadOptions() {
    if (options) return;
    const res = await fetch("/api/options");
    const j = await res.json();
    if (j.ok) setOptions(j.medications);
  }

  async function savePatient() {
    setSavingPatient(true);
    try {
      const payload: any = { name: editName, email: editEmail };
      if (newPassword.trim().length >= 6) payload.password = newPassword.trim();

      const res = await fetch(`/api/admin/patients/${patientId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error ?? "Update failed");
      setNewPassword("");
      router.refresh();
    } finally {
      setSavingPatient(false);
    }
  }

  async function addAppointment() {
    const res = await fetch(`/api/admin/patients/${patientId}/appointments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        provider: apptProvider,
        startAt: apptStartAt,
        repeat: apptRepeat,
        repeatUntil: apptRepeatUntil ? apptRepeatUntil : null,
      }),
    });
    const j = await res.json();
    if (!j.ok) throw new Error(j.error ?? "Create appointment failed");
    setApptStartAt("");
    setApptRepeat("none");
    setApptRepeatUntil("");
    router.refresh();
  }

  async function updateAppointment(a: Appointment, patch: Partial<Appointment>) {
    const res = await fetch(`/api/admin/appointments/${a.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    const j = await res.json();
    if (!j.ok) throw new Error(j.error ?? "Update appointment failed");
    router.refresh();
  }

  async function deleteAppointment(a: Appointment) {
    const res = await fetch(`/api/admin/appointments/${a.id}`, { method: "DELETE" });
    const j = await res.json();
    if (!j.ok) throw new Error(j.error ?? "Delete appointment failed");
    router.refresh();
  }

  async function addPrescription() {
    await loadOptions();
    const res = await fetch(`/api/admin/patients/${patientId}/prescriptions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        medication: rxMedication,
        dosage: rxDosage,
        quantity: rxQty,
        refillOn: rxRefillOn,
        refillSchedule: rxSchedule,
      }),
    });
    const j = await res.json();
    if (!j.ok) throw new Error(j.error ?? "Create prescription failed");
    setRxRefillOn("");
    setRxQty(1);
    router.refresh();
  }

  async function updatePrescription(p: Prescription, patch: Partial<Prescription>) {
    const res = await fetch(`/api/admin/prescriptions/${p.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    const j = await res.json();
    if (!j.ok) throw new Error(j.error ?? "Update prescription failed");
    router.refresh();
  }

  async function deletePrescription(p: Prescription) {
    const res = await fetch(`/api/admin/prescriptions/${p.id}`, { method: "DELETE" });
    const j = await res.json();
    if (!j.ok) throw new Error(j.error ?? "Delete prescription failed");
    router.refresh();
  }

  return (
    <div style={{ marginTop: 18, display: "grid", gap: 18 }}>
      <section style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: 14 }}>
        <h2 style={{ marginTop: 0 }}>Patient CRU</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 740 }}>
          <label>
            Name
            <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 6 }} />
          </label>
          <label>
            Email
            <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 6 }} />
          </label>
          <label style={{ gridColumn: "1 / -1" }}>
            Reset password (optional)
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: "100%", padding: 10, marginTop: 6 }}
            />
          </label>
        </div>
        <button onClick={savePatient} disabled={savingPatient} style={{ marginTop: 12, padding: 10 }}>
          {savingPatient ? "Saving..." : "Save patient"}
        </button>
      </section>

      <section style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: 14 }}>
        <h2 style={{ marginTop: 0 }}>Appointments CRUD</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 220px 140px 220px 140px", gap: 10, alignItems: "end" }}>
          <label>
            Provider
            <input value={apptProvider} onChange={(e) => setApptProvider(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 6 }} />
          </label>
          <label>
            Start (ISO or datetime-local)
            <input value={apptStartAt} onChange={(e) => setApptStartAt(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 6 }} />
          </label>
          <label>
            Repeat
            <select value={apptRepeat} onChange={(e) => setApptRepeat(e.target.value as any)} style={{ width: "100%", padding: 10, marginTop: 6 }}>
              <option value="none">none</option>
              <option value="weekly">weekly</option>
              <option value="monthly">monthly</option>
            </select>
          </label>
          <label>
            Repeat until (optional)
            <input
              value={apptRepeatUntil}
              onChange={(e) => setApptRepeatUntil(e.target.value)}
              style={{ width: "100%", padding: 10, marginTop: 6 }}
            />
          </label>
          <button onClick={addAppointment} style={{ padding: 10 }}>
            Add
          </button>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {props.appointments.map((a) => (
            <div key={a.id} style={{ border: "1px solid rgba(255,255,255,0.10)", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{a.provider}</div>
                  <div style={{ opacity: 0.85 }}>{fmt(a.startAt)}</div>
                  <div style={{ opacity: 0.75, marginTop: 4 }}>
                    Repeat: {a.repeat}
                    {a.repeatUntil ? `, until ${fmt(a.repeatUntil)}` : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button onClick={() => updateAppointment(a, { repeat: "none", repeatUntil: null as any })} style={{ padding: 8 }}>
                    End repeat
                  </button>
                  <button onClick={() => deleteAppointment(a)} style={{ padding: 8 }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!props.appointments.length ? <div style={{ opacity: 0.8 }}>No appointments in next 3 months</div> : null}
        </div>
      </section>

      <section style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: 14 }}>
        <h2 style={{ marginTop: 0 }}>Prescriptions CRUD</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 220px 160px 120px", gap: 10, alignItems: "end" }}>
          <label>
            Medication
            <select
              value={rxMedication}
              onChange={(e) => {
                setRxMedication(e.target.value);
                setRxDosage("");
              }}
              onFocus={loadOptions}
              style={{ width: "100%", padding: 10, marginTop: 6 }}
            >
              <option value="">Select</option>
              {medicationNames.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label>
            Dosage
            <select value={rxDosage} onChange={(e) => setRxDosage(e.target.value)} onFocus={loadOptions} style={{ width: "100%", padding: 10, marginTop: 6 }}>
              <option value="">Select</option>
              {dosageOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          <label>
            Qty
            <input
              type="number"
              min={1}
              value={rxQty}
              onChange={(e) => setRxQty(Number(e.target.value))}
              style={{ width: "100%", padding: 10, marginTop: 6 }}
            />
          </label>

          <label>
            Refill on
            <input value={rxRefillOn} onChange={(e) => setRxRefillOn(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 6 }} />
          </label>

          <label>
            Schedule
            <select value={rxSchedule} onChange={(e) => setRxSchedule(e.target.value as any)} style={{ width: "100%", padding: 10, marginTop: 6 }}>
              <option value="none">none</option>
              <option value="weekly">weekly</option>
              <option value="monthly">monthly</option>
            </select>
          </label>

          <button onClick={addPrescription} style={{ padding: 10 }}>
            Add
          </button>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {props.prescriptions.map((p) => (
            <div key={p.id} style={{ border: "1px solid rgba(255,255,255,0.10)", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>
                    {p.medication} {p.dosage}
                  </div>
                  <div style={{ opacity: 0.85 }}>
                    Qty: {p.quantity}, schedule: {p.refillSchedule}
                  </div>
                  <div style={{ opacity: 0.75, marginTop: 4 }}>Refill: {fmt(p.refillOn)}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button onClick={() => updatePrescription(p, { refillSchedule: "none" as any })} style={{ padding: 8 }}>
                    Stop schedule
                  </button>
                  <button onClick={() => deletePrescription(p)} style={{ padding: 8 }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!props.prescriptions.length ? <div style={{ opacity: 0.8 }}>No refills in next 3 months</div> : null}
        </div>
      </section>
    </div>
  );
}
