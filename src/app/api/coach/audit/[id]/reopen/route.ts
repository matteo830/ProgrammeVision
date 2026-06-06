import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || !["COACH", "ADMIN"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const audit = await prisma.auditResponse.findUnique({ where: { id } });
  if (!audit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.auditResponse.update({
    where: { id },
    data: { status: "DRAFT", submittedAt: null },
  });

  return NextResponse.json(updated);
}
