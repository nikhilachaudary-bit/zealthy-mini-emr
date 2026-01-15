// src/app/portal/ui/LogoutButton.tsx
"use client"

export default function LogoutButton() {
  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/"
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      style={{
        border: "1px solid rgba(255,255,255,0.18)",
        background: "transparent",
        color: "white",
        padding: "8px 12px",
        borderRadius: 10,
        cursor: "pointer",
      }}
    >
      Logout
    </button>
  )
}
