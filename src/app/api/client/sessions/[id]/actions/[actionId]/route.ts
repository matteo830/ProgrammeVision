import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; actionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, actionId } = await params;
  const userId = session.user.id;

  const coachingSession = await prisma.coachingSession.findUnique({
    where: { id },
    select: { clientId: true },
  });

  if (!coachingSession) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  if (coachingSession.clientId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existingAction = await prisma.sessionAction.findUnique({
    where: { id: actionId },
    select: { id: true, content: true, addedToDashboard: true, sessionId: true },
  });

  if (!existingAction || existingAction.sessionId !== id) {
    return NextResponse.json({ error: "Action introuvable" }, { status: 404 });
  }

  const body = await req.json();
  const { completedByClient, addedToDashboard } = body;

  const data: Record<string, unknown> = {};
  if (completedByClient !== undefined) {
    data.completedByClient = completedByClient;
    if (completedByClient === true) {
      data.completedAt = new Date();
    } else if (completedByClient === false) {
      data.completedAt = null;
    }
  }
  if (addedToDashboard !== undefined) {
    data.addedToDashboard = addedToDashboard;
  }

  if (addedToDashboard === true && !existingAction.addedToDashboard) {
    const activeCount = await prisma.dailyAction.count({
      where: { userId, completed: false },
    });

    await prisma.dailyAction.create({
      data: {
        userId,
        content: existingAction.content,
        order: activeCount + 1,
      },
    });
  }

  const updated = await prisma.sessionAction.update({
    where: { id: actionId },
    data,
  });

  return NextResponse.json(updated);
}
