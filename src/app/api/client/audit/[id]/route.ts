import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const audit = await prisma.auditResponse.findUnique({
    where: { id },
    include: {
      comments: {
        include: { coach: { select: { firstName: true, lastName: true } } },
        orderBy: { section: "asc" },
      },
    },
  });

  if (!audit || audit.clientId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(audit);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { responses } = await req.json() as { responses: Record<string, unknown> };

  const audit = await prisma.auditResponse.findUnique({ where: { id } });
  if (!audit || audit.clientId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (audit.status === "SUBMITTED") {
    return NextResponse.json({ error: "Audit already submitted" }, { status: 400 });
  }

  const updated = await prisma.auditResponse.update({
    where: { id },
    data: { responses },
  });

  return NextResponse.json(updated);
}
