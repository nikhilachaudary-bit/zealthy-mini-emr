"use client";

import { useEffect, useMemo, useState } from "react";

type Prescription = {
  id: number;
  medication: string;
  dosage: string;
  quantity: number;
  refillOn: string;
  refillSchedule: string;
};

export default function PrescriptionsClient({
  patientId,
  meds,
  dosages,
}: {
  patientId: number;
  meds: string[];
  dosages: string[];
}) {
  const [items, setItems] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  const [medication, setMedication] = useState(meds[0] ?? "");
  const [dosage, setDosage] = useState(dosages[0] ?? "");
  const [quantity, setQuantity] = useState(30);
  const [refillOn, setRefillOn] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().slice(0, 10);
  });
  const refillSchedule = "monthly";

  const apiBase = useMemo(
    () => `/api/admin/patients/${patientId}/prescriptions`,
    [patientId]
  );

  async function refresh() {
    setLoading(true);
    const res = await fetch(apiBase);
    const json = await res.json();
    setItems(json.prescriptions ?? []);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, [apiBase]);

  async function add() {
    await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        medication,
        dosage,
        quantity,
        refillOn,
        refillSchedule,
      }),
    });
    refresh();
  }

  async function remove(id: number) {
    await fetch(`${apiBase}/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
          gap: 8,
          alignItems: "end",
          maxWidth: 900,
        }}
      >
        <div>
          <div style={{ opacity: 0.8, marginBottom: 6 }}>Medication</div>
          <select
            value={medication}
            onChange={(e) => setMedication(e.target.value)}
            style={{ width: "100%", padding: 10 }}
          >
            {meds.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div style={{ opacity: 0.8, marginBottom: 6 }}>Dosage</div>
          <select
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            style={{ width: "100%", padding: 10 }}
          >
            {dosages.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div style={{ opacity: 0.8, marginBottom: 6 }}>Qty</div>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        <div>
          <div style={{ opacity: 0.8, marginBottom: 6 }}>Refill date</div>
          <input
            type="date"
            value={refillOn}
            onChange={(e) => setRefillOn(e.target.value)}
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        <button onClick={add} style={{ padding: "10px 14px" }}>
          Add
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        {loading ? (
          <div style={{ opacity: 0.8 }}>Loading...</div>
        ) : items.length === 0 ? (
          <div style={{ opacity: 0.8 }}>No prescriptions</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {items.map((p) => (
              <div
                key={p.id}
                style={{
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 8,
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {p.medication} {p.dosage}
                  </div>
                  <div style={{ opacity: 0.8 }}>
                    Qty {p.quantity}, refill{" "}
                    {new Date(p.refillOn).toLocaleDateString()} ({p.refillSchedule})
                  </div>
                </div>
                <button onClick={() => remove(p.id)} style={{ padding: "8px 12px" }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
