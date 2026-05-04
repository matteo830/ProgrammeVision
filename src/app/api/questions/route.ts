import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  const where =
    session.user.role === "COACH"
      ? clientId ? { userId: clientId } : {}
      : { userId: session.user.id };

  const questions = await prisma.question.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { firstName: true, lastName: true, avatarUrl: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { firstName: true, lastName: true, role: true } },
        },
      },
    },
  });

  return NextResponse.json(questions);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { category, content } = body;

  const question = await prisma.question.create({
    data: {
      userId: session.user.id,
      category,
      content,
    },
    include: {
      user: { select: { firstName: true, lastName: true } },
      replies: { orderBy: { createdAt: 'asc' as const } },
    },
  });

  return NextResponse.json(question);
}
