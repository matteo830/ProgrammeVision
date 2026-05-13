import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const includeInactive = searchParams.get("includeInactive") === "true";

  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (!includeInactive) where.isActive = true;

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      clientProfile: true,
      moduleProgresses: { where: { coachValidated: true } },
    },
    omit: { password: true },
  });

  const totalModules = await prisma.module.count();

  const result = users.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    avatarUrl: u.avatarUrl,
    createdAt: u.createdAt,
    programStartDate: u.clientProfile?.programStartDate ?? null,
    validatedModules: u.moduleProgresses.length,
    totalModules,
    progressPercent: totalModules > 0 ? Math.round((u.moduleProgresses.length / totalModules) * 100) : 0,
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, password, firstName, lastName, role, programStartDate } = await req.json();

  if (!email || !password || !firstName || !lastName || !role) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  if (!["CLIENT", "COACH", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      firstName,
      lastName,
      role,
      ...(role === "CLIENT" && {
        clientProfile: {
          create: {
            programStartDate: programStartDate ? new Date(programStartDate) : new Date(),
            programEndDate: programStartDate
              ? new Date(new Date(programStartDate).setMonth(new Date(programStartDate).getMonth() + 6))
              : new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    },
  });

  return NextResponse.json({ success: true, userId: user.id });
}
