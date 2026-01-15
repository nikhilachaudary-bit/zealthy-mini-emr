"use client";

import { useEffect, useMemo, useState } from "react";

type Appointment = {
  id: number;
  provider: string;
  startAt: string;
  repeat: string;
  repeatUntil: string | null;
};

export default function AppointmentsClient({ patientId }: { patientId: number }) {
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [provider, setProvider] = useState("Dr. Lee");
  const [startAt, setStartAt] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [repeat, setRepeat] = useState("weekly");

  const apiBase = useMemo(
    () => `/api/admin/patients/${patientId}/appointments`,
    [patientId]
  );

  async function refresh() {
    setLoading(true);
    const res = await fetch(apiBase);
    const json = await res.json();
    setItems(json.appointments ?? []);
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
        provider,
        startAt: new Date(startAt).toISOString(),
        repeat,
      }),
    });
    refresh();
  }

  async function endRecurring(a: Appointment) {
    const today = new Date();
    await fetch(`${apiBase}/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: a.provider,
        startAt: a.startAt,
        repeat: a.repeat,
        repeatUntil: today.toISOString(),
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
          gridTemplateColumns: "2fr 2fr 1fr auto",
          gap: 8,
          alignItems: "end",
          maxWidth: 900,
        }}
      >
        <div>
          <div style={{ opacity: 0.8, marginBottom: 6 }}>Provider</div>
          <input
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        <div>
          <div style={{ opacity: 0.8, marginBottom: 6 }}>Start</div>
          <input
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        <div>
          <div style={{ opacity: 0.8, marginBottom: 6 }}>Repeat</div>
          <select
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            style={{ width: "100%", padding: 10 }}
          >
            <option value="none">none</option>
            <option value="weekly">weekly</option>
            <option value="monthly">monthly</option>
          </select>
        </div>

        <button onClick={add} style={{ padding: "10px 14px" }}>
          Add
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        {loading ? (
          <div style={{ opacity: 0.8 }}>Loading...</div>
        ) : items.length === 0 ? (
          <div style={{ opacity: 0.8 }}>No appointments</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {items.map((a) => (
              <div
                key={a.id}
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
                  <div style={{ fontWeight: 600 }}>{a.provider}</div>
                  <div style={{ opacity: 0.8 }}>
                    {new Date(a.startAt).toLocaleString()} , repeat {a.repeat}
                    {a.repeatUntil
                      ? ` (until ${new Date(a.repeatUntil).toLocaleDateString()})`
                      : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => endRecurring(a)}
                    style={{ padding: "8px 12px" }}
                  >
                    End recurring
                  </button>
                  <button onClick={() => remove(a.id)} style={{ padding: "8px 12px" }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
