import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const audits = await prisma.auditResponse.findMany({
    where: { clientId: session.user.id, status: "SUBMITTED" },
    select: { id: true, type: true, submittedAt: true, responses: true },
    orderBy: { submittedAt: "asc" },
  });

  return NextResponse.json(audits);
}
