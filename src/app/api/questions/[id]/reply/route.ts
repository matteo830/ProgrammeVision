import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { content } = body;

  const reply = await prisma.questionReply.create({
    data: {
      questionId: id,
      authorId: session.user.id,
      content,
    },
    include: {
      author: { select: { firstName: true, lastName: true, role: true } },
    },
  });

  if (session.user.role === "COACH") {
    await prisma.question.update({
      where: { id },
      data: { status: "ANSWERED" },
    });
  }

  return NextResponse.json(reply);
}
