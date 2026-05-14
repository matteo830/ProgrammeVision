import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { lessonId, status } = await req.json();
  if (!lessonId || !["NOT_STARTED", "IN_PROGRESS", "DONE"].includes(status)) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    update: { status },
    create: { userId: session.user.id, lessonId, status },
  });

  return NextResponse.json(progress);
}
