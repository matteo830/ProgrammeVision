import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { moduleId } = await params;
  const { title } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Titre requis" }, { status: 400 });

  const count = await prisma.lesson.count({ where: { moduleId } });
  const lesson = await prisma.lesson.create({
    data: { moduleId, title: title.trim(), order: count },
  });

  return NextResponse.json(lesson, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { moduleId } = await params;
  const { lessonId } = await req.json();
  await prisma.lesson.delete({ where: { id: lessonId, moduleId } });
  return NextResponse.json({ success: true });
}
