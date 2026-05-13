import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (
    !session?.user?.id ||
    (session.user.role !== "COACH" && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { clientId, title, type, scheduledAt, duration, meetingUrl } = body;

  if (!title || !type || !scheduledAt) {
    return NextResponse.json(
      { error: "Champs obligatoires manquants : title, type, scheduledAt" },
      { status: 400 }
    );
  }

  const coachingSession = await prisma.coachingSession.create({
    data: {
      coachId: session.user.id,
      clientId: clientId ?? null,
      title,
      type,
      scheduledAt: new Date(scheduledAt),
      duration: duration ?? null,
      meetingUrl: meetingUrl ?? null,
    },
  });

  return NextResponse.json(coachingSession, { status: 201 });
}
