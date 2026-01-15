import { cookies } from "next/headers";

export const COOKIE_NAME = "zealthy_patient_id";

export async function getSessionPatientId(): Promise<number | null> {
  const store = await cookies();
  const v = store.get(COOKIE_NAME)?.value;
  if (!v) return null;
  const n = Number.parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}

export async function setSessionPatientId(patientId: number) {
  const store = await cookies();
  store.set(COOKIE_NAME, String(patientId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function clearSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
