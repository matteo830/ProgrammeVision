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
  { params }: { params: Promise<{ moduleId: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { moduleId } = await params;
  const { title, driveFileId } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Titre requis" }, { status: 400 });
  if (!driveFileId?.trim()) return NextResponse.json({ error: "Drive File ID requis" }, { status: 400 });

  const count = await prisma.moduleTemplate.count({ where: { moduleId } });
  const template = await prisma.moduleTemplate.create({
    data: { moduleId, title: title.trim(), driveFileId: driveFileId.trim(), order: count },
  });

  // Copy for all existing active clients
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT", isActive: true },
    select: { id: true, firstName: true, lastName: true },
  });

  await Promise.allSettled(
    clients.map(async (client) => {
      try {
        const { driveFileId: fileId, driveUrl } = await copyTemplate(
          template.driveFileId,
          `${template.title} — ${client.firstName} ${client.lastName}`
        );
        await prisma.clientDocument.create({
          data: { userId: client.id, templateId: template.id, driveFileId: fileId, driveUrl },
        });
      } catch {
        console.error(`Drive copy failed for client ${client.id}, template ${template.id}`);
      }
    })
  );

  return NextResponse.json(template, { status: 201 });
}
