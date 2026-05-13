import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { clientProfile: true },
    omit: { password: true },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { firstName, lastName, avatarUrl, phone, currentPassword, newPassword, profile } = body;

  if (newPassword) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const valid = user.password ? await bcrypt.compare(currentPassword, user.password) : false;
    if (!valid) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(phone !== undefined && { phone: phone || null }),
    },
    omit: { password: true },
  });

  if (profile && session.user.role === "CLIENT") {
    await prisma.clientProfile.upsert({
      where: { userId: session.user.id },
      update: profile,
      create: { userId: session.user.id, ...profile },
    });
  }

  return NextResponse.json(updated);
}
