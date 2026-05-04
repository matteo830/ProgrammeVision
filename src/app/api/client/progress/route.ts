import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientProgress } from "@/lib/progress";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const progress = await getClientProgress(session.user.id);
  return NextResponse.json(progress);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { moduleId, field, value } = body;

  const allowed = ["videoWatched", "exerciseSubmitted", "realImplementation", "submissionNote"];
  if (!allowed.includes(field)) {
    return NextResponse.json({ error: "Invalid field" }, { status: 400 });
  }

  const progress = await prisma.moduleProgress.upsert({
    where: { userId_moduleId: { userId: session.user.id, moduleId } },
    update: {
      [field]: value,
      ...(field === "videoWatched" && value && { videoWatchedAt: new Date() }),
      ...(field === "exerciseSubmitted" && value && { submittedAt: new Date() }),
    },
    create: {
      userId: session.user.id,
      moduleId,
      [field]: value,
      ...(field === "videoWatched" && value && { videoWatchedAt: new Date() }),
      ...(field === "exerciseSubmitted" && value && { submittedAt: new Date() }),
    },
  });

  return NextResponse.json(progress);
}
