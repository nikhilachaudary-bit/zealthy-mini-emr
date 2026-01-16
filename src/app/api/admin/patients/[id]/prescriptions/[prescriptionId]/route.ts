import { prisma } from "@/lib/prisma";


export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; prescriptionId: string }> }
) {
  const { id, prescriptionId } = await params;
  const patientId = Number.parseInt(id, 10);
  const pid = Number.parseInt(prescriptionId, 10);

  const body = await req.json();

  const updated = await prisma.prescription.update({
    where: { id: pid },
    data: {
      patientId,
      medication: body.medication,
      dosage: body.dosage,
      quantity: Number(body.quantity),
      refillOn: new Date(body.refillOn),
      refillSchedule: body.refillSchedule,
    },
  });

  return Response.json({ ok: true, prescription: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ prescriptionId: string }> }
) {
  const { prescriptionId } = await params;
  const pid = Number.parseInt(prescriptionId, 10);

  await prisma.prescription.delete({ where: { id: pid } });

  return Response.json({ ok: true });
}
