import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const now = new Date();

  const [upcoming, past, assignment, availableCoaches] = await Promise.all([
    prisma.coachingSession.findFirst({
      where: {
        clientId: userId,
        scheduledAt: { gt: now },
      },
      orderBy: { scheduledAt: "asc" },
      include: {
        coach: { select: { firstName: true, lastName: true } },
      },
    }),

    prisma.coachingSession.findMany({
      where: {
        clientId: userId,
        scheduledAt: { lt: now },
      },
      orderBy: { scheduledAt: "desc" },
      include: {
        actions: true,
        notes: {
          where: { visibility: "CLIENT_VISIBLE" },
          orderBy: { createdAt: "desc" },
        },
        coach: { select: { firstName: true, lastName: true } },
      },
    }),

    prisma.coachClientAssignment.findFirst({
      where: { clientId: userId },
      include: {
        coach: {
          select: { firstName: true, lastName: true, ghlCalendarSlug: true },
        },
      },
    }),

    prisma.user.findMany({
      where: {
        role: { in: ["COACH", "ADMIN"] },
        isActive: true,
        ghlCalendarSlug: { not: null },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        ghlCalendarSlug: true,
      },
    }),
  ]);

  return NextResponse.json({
    upcoming,
    past,
    assignedCoach: assignment?.coach ?? null,
    availableCoaches,
  });
}
