// src/app/lib/getPatientIdFromCookie.ts
import { getSessionPatientId } from "@/app/lib/session"

export async function getPatientIdFromCookie() {
  return getSessionPatientId()
}
