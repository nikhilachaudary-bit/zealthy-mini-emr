import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  const id = Number(ctx.params.id);
  const body = await req.json();
  const { provider, startAt, repeat, repeatUntil } = body;

  const data: any = {};
  if (provider !== undefined) data.provider = provider;
  if (startAt !== undefined) data.startAt = new Date(startAt);
  if (repeat !== undefined) data.repeat = repeat;
  if (repeatUntil !== undefined) data.repeatUntil = repeatUntil ? new Date(repeatUntil) : null;

  const appointment = await prisma.appointment.update({ where: { id }, data });
  return Response.json({ ok: true, appointment });
}

export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  const id = Number(ctx.params.id);
  await prisma.appointment.delete({ where: { id } });
  return Response.json({ ok: true });
}
