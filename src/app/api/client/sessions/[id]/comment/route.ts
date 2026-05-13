import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
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

  const body = await req.json();
  const { content } = body;

  if (!content) {
    return NextResponse.json({ error: "content est obligatoire" }, { status: 400 });
  }

  const note = await prisma.coachingNote.create({
    data: {
      sessionId: id,
      authorId: userId,
      clientId: userId,
      content,
      visibility: "CLIENT_VISIBLE",
    },
    include: {
      author: { select: { firstName: true, lastName: true } },
    },
  });

  return NextResponse.json(note, { status: 201 });
}
