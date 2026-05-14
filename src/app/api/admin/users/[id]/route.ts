import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { firstName, lastName, email, password, isActive, ghlCalendarSlug } = body;

  const data: Record<string, unknown> = {};
  if (firstName !== undefined) data.firstName = firstName;
  if (lastName !== undefined) data.lastName = lastName;
  if (email !== undefined) data.email = email;
  if (isActive !== undefined) data.isActive = isActive;
  if (password) data.password = await bcrypt.hash(password, 12);
  if (ghlCalendarSlug !== undefined) {
    const raw: string = ghlCalendarSlug ?? "";
    const match = raw.match(/widget\/booking\/([A-Za-z0-9]+)/);
    data.ghlCalendarSlug = match ? match[1] : raw || null;
  }

  // Empêcher de se désactiver soi-même
  if (isActive === false && id === session.user.id) {
    return NextResponse.json({ error: "Vous ne pouvez pas désactiver votre propre compte" }, { status: 400 });
  }

  const user = await prisma.user.update({ where: { id }, data, omit: { password: true } });
  return NextResponse.json(user);
}
