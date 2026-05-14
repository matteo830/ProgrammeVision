import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { moduleId } = await params;
  const { title, description, templateDriveId, order } = await req.json();

  const module = await prisma.courseModule.update({
    where: { id: moduleId },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(templateDriveId !== undefined && { templateDriveId: templateDriveId?.trim() || null }),
      ...(order !== undefined && { order }),
    },
    include: { lessons: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json(module);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { moduleId } = await params;
  await prisma.courseModule.delete({ where: { id: moduleId } });
  return NextResponse.json({ success: true });
}
