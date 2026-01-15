"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PatientForm(props: {
  mode: "create" | "update";
  patientId?: number;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(props.defaultName ?? "");
  const [email, setEmail] = useState(props.defaultEmail ?? "");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const payload: any = { name, email };
    if (password.trim()) payload.password = password;

    const res =
      props.mode === "create"
        ? await fetch("/api/admin/patients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, password }),
          })
        : await fetch(`/api/admin/patients/${props.patientId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

    if (!res.ok) {
      setMsg("Save failed");
      return;
    }

    const data = await res.json();

    if (props.mode === "create") {
      router.push(`/admin/patients/${data.patient.id}`);
      router.refresh();
      return;
    }

    setPassword("");
    setMsg("Saved");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm">Name</label>
          <input className="w-full border rounded px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Email</label>
          <input className="w-full border rounded px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm">Password {props.mode === "update" ? "(set to change)" : ""}</label>
        <input className="w-full border rounded px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required={props.mode === "create"} />
      </div>

      {msg && <p className="text-sm">{msg}</p>}

      <button className="border rounded px-3 py-2 text-sm" type="submit">
        {props.mode === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
}
