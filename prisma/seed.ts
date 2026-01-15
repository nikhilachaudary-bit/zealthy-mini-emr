import { PrismaClient, RepeatSchedule, RefillSchedule } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type SeedJson = {
  medications: { name: string; dosages: string[] }[];
  patients: {
    id?: number;
    name: string;
    email: string;
    password: string;
    appointments: {
      provider: string;
      startAt: string;
      repeat: "none" | "weekly" | "monthly";
      repeatUntil?: string | null;
    }[];
    prescriptions: {
      medication: string;
      dosage: string;
      quantity: number;
      refillOn: string;
      refillSchedule: "none" | "weekly" | "monthly";
    }[];
  }[];
};

const GIST_URL =
  "https://gist.githubusercontent.com/sbraford/73f63d75bb995b6597754c1707e40cc2/raw/data.json";

function toRepeat(v: string): RepeatSchedule {
  if (v === "weekly") return RepeatSchedule.weekly;
  if (v === "monthly") return RepeatSchedule.monthly;
  return RepeatSchedule.none;
}

function toRefill(v: string): RefillSchedule {
  if (v === "weekly") return RefillSchedule.weekly;
  if (v === "monthly") return RefillSchedule.monthly;
  return RefillSchedule.none;
}

async function fetchSeedJson(): Promise<SeedJson> {
  const res = await fetch(GIST_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch seed JSON: ${res.status}`);
  return (await res.json()) as SeedJson;
}

async function main() {
  const data = await fetchSeedJson();

  await prisma.dosageOption.deleteMany();
  await prisma.medicationOption.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();

  for (const m of data.medications) {
    const med = await prisma.medicationOption.create({
      data: { name: m.name },
    });

    if (m.dosages?.length) {
      await prisma.dosageOption.createMany({
        data: m.dosages.map((d) => ({ medicationId: med.id, value: d })),
      });
    }
  }

  for (const p of data.patients) {
    const passwordHash = await bcrypt.hash(p.password, 10);

    const patient = await prisma.patient.create({
      data: {
        name: p.name,
        email: p.email,
        passwordHash,
      },
    });

    if (p.appointments?.length) {
      await prisma.appointment.createMany({
        data: p.appointments.map((a) => ({
          patientId: patient.id,
          provider: a.provider,
          startAt: new Date(a.startAt),
          repeat: toRepeat(a.repeat),
          repeatUntil: a.repeatUntil ? new Date(a.repeatUntil) : null,
        })),
      });
    }

    if (p.prescriptions?.length) {
      await prisma.prescription.createMany({
        data: p.prescriptions.map((rx) => ({
          patientId: patient.id,
          medication: rx.medication,
          dosage: rx.dosage,
          quantity: rx.quantity,
          refillOn: new Date(rx.refillOn),
          refillSchedule: toRefill(rx.refillSchedule),
        })),
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
