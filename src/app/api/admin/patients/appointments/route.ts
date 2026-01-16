import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";


export const runtime = "nodejs";

export async function GET(_: Request, ctx: { params: { id: string } }) {
  const id = Number(ctx.params.id);
  const patient = await prisma.patient.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
  });
  if (!patient) return Response.json({ ok: false }, { status: 404 });
  return Response.json({ ok: true, patient });
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  const id = Number(ctx.params.id);
  const body = await req.json();
  const { name, email, password } = body;

  const data: any = {};
  if (name) data.name = name;
  if (email) data.email = email;
  if (password) data.passwordHash = await bcrypt.hash(password, 10);

  const patient = await prisma.patient.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true },
  });

  return Response.json({ ok: true, patient });
}
