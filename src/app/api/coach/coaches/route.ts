import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const coaches = await prisma.user.findMany({
    where: { role: { in: ["COACH", "ADMIN"] } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, firstName: true, lastName: true, email: true,
      role: true, isActive: true, createdAt: true,
      ghlCalendarSlug: true,
      assignedClients: { select: { id: true } },
    },
  });

  return NextResponse.json(coaches);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { email, password, firstName, lastName, role = "COACH" } = body;

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hashed, firstName, lastName, role },
  });

  return NextResponse.json({ success: true, userId: user.id });
}
