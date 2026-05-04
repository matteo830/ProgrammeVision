import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWeekStart } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const victories = await prisma.weeklyVictory.findMany({
    where: { userId: session.user.id },
    orderBy: { weekStartDate: "desc" },
    take: 10,
  });

  return NextResponse.json(victories);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await req.json();
  const weekStart = getWeekStart();

  const victory = await prisma.weeklyVictory.create({
    data: {
      userId: session.user.id,
      content,
      weekStartDate: weekStart,
    },
  });

  return NextResponse.json(victory);
}
