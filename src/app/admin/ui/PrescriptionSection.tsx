"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Prescription = {
  id: number;
  medication: string;
  dosage: string;
  quantity: number;
  refillOn: string | Date;
  refillSchedule: "monthly";
};

export default function PrescriptionSection(props: {
  patientId: number;
  initial: Prescription[];
  medicationOptions: string[];
  dosageOptions: string[];
}) {
  const router = useRouter();
  const [medication, setMedication] = useState(props.medicationOptions[0] ?? "");
  const [dosage, setDosage] = useState(props.dosageOptions[0] ?? "");
  const [quantity, setQuantity] = useState(30);
  const [refillOn, setRefillOn] = useState("");
  const [refillSchedule, setRefillSchedule] = useState<"monthly">("monthly");
  const [msg, setMsg] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const res = await fetch(`/api/admin/patients/${props.patientId}/prescriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medication, dosage, quantity, refillOn, refillSchedule }),
    });

    if (!res.ok) {
      setMsg("Create failed");
      return;
    }

    setQuantity(30);
    setRefillOn("");
    setRefillSchedule("monthly");
    router.refresh();
  }

  async function remove(id: number) {
    const res = await fetch(`/api/admin/prescriptions/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={create} className="border rounded p-3 space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm">Medication</label>
            <select className="w-full border rounded px-3 py-2" value={medication} onChange={(e) => setMedication(e.target.value)}>
              {props.medicationOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm">Dosage</label>
            <select className="w-full border rounded px-3 py-2" value={dosage} onChange={(e) => setDosage(e.target.value)}>
              {props.dosageOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-sm">Quantity</label>
            <input className="w-full border rounded px-3 py-2" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} type="number" min={1} />
          </div>
          <div className="space-y-1">
            <label className="text-sm">Refill date</label>
            <input className="w-full border rounded px-3 py-2" value={refillOn} onChange={(e) => setRefillOn(e.target.value)} type="date" required />
          </div>
          <div className="space-y-1">
            <label className="text-sm">Refill schedule</label>
            <select className="w-full border rounded px-3 py-2" value={refillSchedule} onChange={(e) => setRefillSchedule(e.target.value as any)}>
              <option value="monthly">monthly</option>
            </select>
          </div>
        </div>

        {msg && <p className="text-sm">{msg}</p>}

        <button className="border rounded px-3 py-2 text-sm" type="submit">
          Add prescription
        </button>
      </form>

      <div className="space-y-2">
        {props.initial.length === 0 ? (
          <p className="text-sm text-gray-600">No prescriptions.</p>
        ) : (
          props.initial.map((p) => (
            <div key={p.id} className="border rounded p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="text-sm">
                <div className="font-semibold">
                  {p.medication} {p.dosage}
                </div>
                <div>quantity: {p.quantity}</div>
                <div className="text-gray-600">
                  refill: {new Date(p.refillOn).toLocaleDateString()} ({p.refillSchedule})
                </div>
              </div>
              <div className="flex gap-2">
                <button className="border rounded px-3 py-2 text-sm" onClick={() => remove(p.id)} type="button">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
