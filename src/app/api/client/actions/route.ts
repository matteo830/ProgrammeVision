import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const actions = await prisma.dailyAction.findMany({
    where: { userId: session.user.id, completed: false },
    orderBy: { order: "asc" },
    take: 3,
  });

  return NextResponse.json(actions);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { content } = body;

  const count = await prisma.dailyAction.count({
    where: { userId: session.user.id, completed: false },
  });

  if (count >= 3) {
    return NextResponse.json(
      { error: "Maximum 3 actions actives autorisées" },
      { status: 400 }
    );
  }

  const action = await prisma.dailyAction.create({
    data: {
      userId: session.user.id,
      content,
      order: count + 1,
    },
  });

  return NextResponse.json(action);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, completed, content } = body;

  const action = await prisma.dailyAction.updateMany({
    where: { id, userId: session.user.id },
    data: { ...(completed !== undefined && { completed }), ...(content && { content }) },
  });

  return NextResponse.json(action);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.dailyAction.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
