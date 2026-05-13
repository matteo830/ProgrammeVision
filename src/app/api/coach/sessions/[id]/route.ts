import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (
    !session?.user?.id ||
    (session.user.role !== "COACH" && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.coachingSession.findUnique({
    where: { id },
    select: { coachId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  if (session.user.role !== "ADMIN" && existing.coachId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    firefliesUrl,
    summary,
    decisions,
    title,
    meetingUrl,
    scheduledAt,
  } = body;

  const data: Record<string, unknown> = {};
  if (firefliesUrl !== undefined) data.firefliesUrl = firefliesUrl;
  if (summary !== undefined) data.summary = summary;
  if (decisions !== undefined) data.decisions = decisions;
  if (title !== undefined) data.title = title;
  if (meetingUrl !== undefined) data.meetingUrl = meetingUrl;
  if (scheduledAt !== undefined) data.scheduledAt = new Date(scheduledAt);

  const updated = await prisma.coachingSession.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}
