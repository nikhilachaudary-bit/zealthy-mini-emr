"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ApiSuccess = { patient: { id: number; name: string; email: string } };
type ApiError = { error?: string };

async function safeJson<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export default function NewPatientPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await safeJson<ApiSuccess & ApiError>(res);

      if (!res.ok) {
        setError(data?.error ?? `Request failed (${res.status})`);
        setLoading(false);
        return;
      }

      const id = data?.patient?.id;
      if (!id) {
        setError("Patient created, but server returned no patient id");
        setLoading(false);
        return;
      }

      router.push(`/admin/patients/${id}`);
      router.refresh();
    } catch {
      setError("Network error while creating patient");
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ margin: 0, fontSize: 24 }}>New patient</h1>

      <form onSubmit={onSubmit} style={{ marginTop: 18, display: "grid", gap: 14 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <div>Name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mark"
            required
            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "white" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div>Email</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="mark@yahoo.net"
            type="email"
            required
            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "white" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div>Password (for testing)</div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password123!"
            type="password"
            required
            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "white" }}
          />
        </label>

        {error ? (
          <div style={{ color: "tomato" }}>{error}</div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.06)",
            color: "white",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Creating..." : "Create patient"}
        </button>
      </form>
    </main>
  );
}
