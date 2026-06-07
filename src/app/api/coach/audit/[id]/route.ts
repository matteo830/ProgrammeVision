import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/coach/audit/[id] — id = clientId : liste les audits d'un client
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || !["COACH", "ADMIN"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: clientId } = await params;

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
