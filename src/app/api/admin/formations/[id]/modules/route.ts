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
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { id: courseId } = await params;
  const { title, description } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Titre requis" }, { status: 400 });

  const count = await prisma.courseModule.count({ where: { courseId } });
  const module = await prisma.courseModule.create({
    data: {
      courseId,
      title: title.trim(),
      description: description?.trim() || null,
      order: count,
    },
    include: { lessons: { orderBy: { order: "asc" } }, templates: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json(module, { status: 201 });
}
