import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
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
  const { content } = body;

  if (!content) {
    return NextResponse.json({ error: "content est obligatoire" }, { status: 400 });
  }

  const action = await prisma.sessionAction.create({
    data: {
      sessionId: id,
      content,
    },
  });

  return NextResponse.json(action, { status: 201 });
}
