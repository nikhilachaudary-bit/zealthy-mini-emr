import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; appointmentId: string }> }
) {
  const { id, appointmentId } = await params;
  const patientId = Number.parseInt(id, 10);
  const aid = Number.parseInt(appointmentId, 10);

  const body = await req.json();

  const updated = await prisma.appointment.update({
    where: { id: aid },
    data: {
      patientId,
      provider: body.provider,
      startAt: new Date(body.startAt),
      repeat: body.repeat,
      repeatUntil: body.repeatUntil ? new Date(body.repeatUntil) : null,
    },
  });

  return Response.json({ ok: true, appointment: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  const { appointmentId } = await params;
  const aid = Number.parseInt(appointmentId, 10);

  await prisma.appointment.delete({ where: { id: aid } });

  return Response.json({ ok: true });
}
