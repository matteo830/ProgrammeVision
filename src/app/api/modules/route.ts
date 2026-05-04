import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const modules = await prisma.module.findMany({
    include: { phase: true },
    orderBy: [{ phase: { order: "asc" } }, { order: "asc" }],
  });
  return NextResponse.json(modules);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, videoUrl, exerciseUrl, title, description } = body;

  const module = await prisma.module.update({
    where: { id },
    data: {
      ...(videoUrl !== undefined && { videoUrl }),
      ...(exerciseUrl !== undefined && { exerciseUrl }),
      ...(title && { title }),
      ...(description !== undefined && { description }),
    },
  });

  return NextResponse.json(module);
}
