import Link from "next/link";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 520, border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: 24 }}>
        <h1 style={{ marginTop: 0 }}>Patient Portal Login</h1>

        <form id="loginForm" style={{ display: "grid", gap: 12 }}>
          <div>
            <div style={{ opacity: 0.8, marginBottom: 6 }}>Email</div>
            <input name="email" type="email" required style={{ width: "100%", padding: 12 }} />
          </div>

          <div>
            <div style={{ opacity: 0.8, marginBottom: 6 }}>Password</div>
            <input name="password" type="password" required style={{ width: "100%", padding: 12 }} />
          </div>

          <button type="submit" style={{ padding: 12 }}>Sign in</button>

          <div id="err" style={{ color: "salmon", minHeight: 20 }} />
        </form>

        <div style={{ marginTop: 14, opacity: 0.8 }}>
          Admin EMR is at <Link href="/admin">/admin</Link> and does not require login.
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
          const form = document.getElementById("loginForm");
          const err = document.getElementById("err");
          form.addEventListener("submit", async (e) => {
            e.preventDefault();
            err.textContent = "";
            const fd = new FormData(form);
            const email = fd.get("email");
            const password = fd.get("password");

            const res = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            });

            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
              err.textContent = json.error || "Login failed";
              return;
            }
            window.location.href = "/portal";
          });
        `,
        }}
      />
    </main>
  );
}
