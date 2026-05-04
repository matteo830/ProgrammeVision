import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const gratitudes = await prisma.gratitude.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 10,
  });

  return NextResponse.json(gratitudes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await req.json();

  const gratitude = await prisma.gratitude.create({
    data: { userId: session.user.id, content },
  });

  return NextResponse.json(gratitude);
}
