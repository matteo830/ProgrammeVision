import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { moduleId, clientId, validated, coachComment } = body;

  const progress = await prisma.moduleProgress.upsert({
    where: { userId_moduleId: { userId: clientId, moduleId } },
    update: {
      coachValidated: validated,
      coachComment: coachComment ?? null,
      validatedAt: validated ? new Date() : null,
    },
    create: {
      userId: clientId,
      moduleId,
      coachValidated: validated,
      coachComment: coachComment ?? null,
      validatedAt: validated ? new Date() : null,
    },
  });

  return NextResponse.json(progress);
}
