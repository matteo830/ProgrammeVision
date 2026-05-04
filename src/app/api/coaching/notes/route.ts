import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  const targetId =
    session.user.role === "COACH" ? clientId ?? session.user.id : session.user.id;

  const where: Record<string, unknown> = { clientId: targetId };

  if (session.user.role === "CLIENT") {
    where.visibility = "CLIENT_VISIBLE";
  }

  const notes = await prisma.coachingNote.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { author: { select: { firstName: true, lastName: true, role: true } } },
  });

  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { content, clientId, visibility, sessionId } = body;

  const targetClientId =
    session.user.role === "COACH" ? clientId : session.user.id;

  if (session.user.role === "CLIENT" && visibility === "TEAM_ONLY") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const note = await prisma.coachingNote.create({
    data: {
      content,
      clientId: targetClientId,
      authorId: session.user.id,
      visibility: visibility ?? "CLIENT_VISIBLE",
      sessionId: sessionId ?? null,
    },
    include: { author: { select: { firstName: true, lastName: true, role: true } } },
  });

  return NextResponse.json(note);
}
