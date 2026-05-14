import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { copyTemplate } from "@/lib/google-drive";
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
  const { title, description, templateDriveId } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Titre requis" }, { status: 400 });

  const count = await prisma.courseModule.count({ where: { courseId } });
  const module = await prisma.courseModule.create({
    data: {
      courseId,
      title: title.trim(),
      description: description?.trim() || null,
      templateDriveId: templateDriveId?.trim() || null,
      order: count,
    },
    include: { lessons: true },
  });

  // If template provided, create a copy for every existing client
  if (module.templateDriveId) {
    const clients = await prisma.user.findMany({
      where: { role: "CLIENT", isActive: true },
      select: { id: true, firstName: true, lastName: true },
    });

    await Promise.allSettled(
      clients.map(async (client) => {
        try {
          const { driveFileId, driveUrl } = await copyTemplate(
            module.templateDriveId!,
            `${module.title} — ${client.firstName} ${client.lastName}`
          );
          await prisma.clientDocument.create({
            data: { userId: client.id, moduleId: module.id, driveFileId, driveUrl },
          });
        } catch {
          // Log but don't fail the whole request
          console.error(`Drive copy failed for client ${client.id}`);
        }
      })
    );
  }

  return NextResponse.json(module, { status: 201 });
}
