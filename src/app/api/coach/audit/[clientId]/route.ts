import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || !["COACH", "ADMIN"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientId } = await params;

  const audits = await prisma.auditResponse.findMany({
    where: { clientId },
    include: {
      comments: {
        include: { coach: { select: { firstName: true, lastName: true } } },
        orderBy: { section: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(audits);
}
