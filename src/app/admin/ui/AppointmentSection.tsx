"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Appointment = {
  id: number;
  provider: string;
  startAt: string | Date;
  repeat: "none" | "weekly" | "monthly";
  repeatUntil: string | Date | null;
};

export default function AppointmentSection(props: { patientId: number; initial: Appointment[] }) {
  const router = useRouter();
  const [provider, setProvider] = useState("");
  const [startAt, setStartAt] = useState("");
  const [repeat, setRepeat] = useState<"none" | "weekly" | "monthly">("none");
  const [msg, setMsg] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const res = await fetch(`/api/admin/patients/${props.patientId}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, startAt, repeat }),
    });

    if (!res.ok) {
      setMsg("Create failed");
      return;
    }

    setProvider("");
    setStartAt("");
    setRepeat("none");
    router.refresh();
  }

  async function endRecurring(id: number) {
    const today = new Date();
    const res = await fetch(`/api/admin/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repeatUntil: today.toISOString() }),
    });
    if (res.ok) router.refresh();
  }

  async function remove(id: number) {
    const res = await fetch(`/api/admin/appointments/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={create} className="border rounded p-3 space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm">Provider</label>
            <input className="w-full border rounded px-3 py-2" value={provider} onChange={(e) => setProvider(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm">Start date time</label>
            <input className="w-full border rounded px-3 py-2" value={startAt} onChange={(e) => setStartAt(e.target.value)} type="datetime-local" required />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm">Repeat schedule</label>
          <select className="w-full border rounded px-3 py-2" value={repeat} onChange={(e) => setRepeat(e.target.value as any)}>
            <option value="none">none</option>
            <option value="weekly">weekly</option>
            <option value="monthly">monthly</option>
          </select>
        </div>

        {msg && <p className="text-sm">{msg}</p>}

        <button className="border rounded px-3 py-2 text-sm" type="submit">
          Add appointment
        </button>
      </form>

      <div className="space-y-2">
        {props.initial.length === 0 ? (
          <p className="text-sm text-gray-600">No appointments.</p>
        ) : (
          props.initial.map((a) => (
            <div key={a.id} className="border rounded p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="text-sm">
                <div className="font-semibold">{a.provider}</div>
                <div>{new Date(a.startAt).toLocaleString()}</div>
                <div className="text-gray-600">
                  repeat: {a.repeat}
                  {a.repeat !== "none" ? `, until: ${a.repeatUntil ? new Date(a.repeatUntil).toLocaleDateString() : "not set"}` : ""}
                </div>
              </div>
              <div className="flex gap-2">
                {a.repeat !== "none" && (
                  <button className="border rounded px-3 py-2 text-sm" onClick={() => endRecurring(a.id)} type="button">
                    End recurring
                  </button>
                )}
                <button className="border rounded px-3 py-2 text-sm" onClick={() => remove(a.id)} type="button">
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
