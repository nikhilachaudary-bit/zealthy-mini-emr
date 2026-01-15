import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";

type CreatePatientBody = {
  name?: string;
  email?: string;
  password?: string;
};

export async function POST(req: Request) {
  let body: CreatePatientBody;

  try {
    body = (await req.json()) as CreatePatientBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!name || !email || !password) {
    return new Response(
      JSON.stringify({ error: "name, email, and password are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const patient = await prisma.patient.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true },
    });

    return new Response(JSON.stringify({ patient }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return new Response(JSON.stringify({ error: "Email already exists" }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Failed to create patient" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
