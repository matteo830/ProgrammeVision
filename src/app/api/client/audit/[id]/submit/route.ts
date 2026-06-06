import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const audit = await prisma.auditResponse.findUnique({ where: { id } });
  if (!audit || audit.clientId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (audit.status === "SUBMITTED") {
    return NextResponse.json({ error: "Already submitted" }, { status: 400 });
  }

  const updated = await prisma.auditResponse.update({
    where: { id },
    data: { status: "SUBMITTED", submittedAt: new Date() },
  });

  return NextResponse.json(updated);
}
