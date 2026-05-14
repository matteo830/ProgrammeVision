import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { id } = await params;
  const { title, description, imageUrl, accessUrl, order, isActive } = await req.json();

  const course = await prisma.ghlCourse.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(imageUrl !== undefined && { imageUrl: imageUrl?.trim() || null }),
      ...(accessUrl !== undefined && { accessUrl: accessUrl?.trim() || null }),
      ...(order !== undefined && { order }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json(course);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { id } = await params;
  await prisma.ghlCourse.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
