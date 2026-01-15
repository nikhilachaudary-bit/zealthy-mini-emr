"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPatientForm() {
  const router = useRouter();
  const [name, setName] = useState("Mark Johnson");
  const [email, setEmail] = useState("mark@some-email-provider.net");
  const [password, setPassword] = useState("Password123!");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/patients", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error ?? "Create failed");
      router.push(`/admin/patients/${j.patient.id}`);
    } catch (e: any) {
      setErr(e?.message ?? "Create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 520 }}>
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 6 }} />
      </label>
      <label>
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 6 }} />
      </label>
      <label>
        Password (for testing)
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
        />
      </label>

      {err ? <div style={{ color: "salmon" }}>{err}</div> : null}

      <button type="submit" disabled={busy} style={{ padding: 10 }}>
        {busy ? "Creating..." : "Create patient"}
      </button>
    </form>
  );
}
