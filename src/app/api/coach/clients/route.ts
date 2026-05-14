import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "COACH" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    orderBy: { createdAt: "desc" },
    include: {
      clientProfile: true,
      moduleProgresses: {
        include: { module: { include: { phase: true } } },
      },
    },
  });

  const totalModules = await prisma.module.count();

  const clientsWithStats = clients.map((client) => {
    const validated = client.moduleProgresses.filter(
      (p) => p.coachValidated
    ).length;

    return {
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      avatarUrl: client.avatarUrl,
      createdAt: client.createdAt,
      progressPercent: totalModules > 0 ? Math.round((validated / totalModules) * 100) : 0,
      validatedModules: validated,
      totalModules,
      programStartDate: client.clientProfile?.programStartDate,
      lastActivity: null,
    };
  });

  return NextResponse.json(clientsWithStats);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "COACH" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { email, password, firstName, lastName, programStartDate } = body;

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json(
      { error: "Champs obligatoires manquants" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      firstName,
      lastName,
      role: "CLIENT",
      clientProfile: {
        create: {
          programStartDate: programStartDate ? new Date(programStartDate) : new Date(),
          programEndDate: programStartDate
            ? new Date(new Date(programStartDate).setMonth(new Date(programStartDate).getMonth() + 6))
            : new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  return NextResponse.json({ success: true, userId: user.id });
}
