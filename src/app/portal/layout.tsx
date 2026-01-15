// src/app/portal/layout.tsx
import Link from "next/link"
import LogoutButton from "@/app/portal/ui/LogoutButton"

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "black", color: "white" }}>
      <header
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontWeight: 700 }}>Patient Portal</div>
        </div>

        <nav style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/portal" style={{ color: "white", textDecoration: "none", opacity: 0.9 }}>
            Summary
          </Link>
          <Link href="/portal/appointments" style={{ color: "white", textDecoration: "none", opacity: 0.9 }}>
            Appointments
          </Link>
          <Link href="/portal/prescriptions" style={{ color: "white", textDecoration: "none", opacity: 0.9 }}>
            Prescriptions
          </Link>
          <Link href="/portal/medications" style={{ color: "white", textDecoration: "none", opacity: 0.9 }}>
            Medications
          </Link>
          <LogoutButton />
        </nav>
      </header>

      <div style={{ padding: 24 }}>{children}</div>
    </div>
  )
}
