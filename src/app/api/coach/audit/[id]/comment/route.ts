import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || !["COACH", "ADMIN"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { section, content } = await req.json() as { section: number; content: string };

  if (!section || !content?.trim()) {
    return NextResponse.json({ error: "section and content required" }, { status: 400 });
  }

  const audit = await prisma.auditResponse.findUnique({ where: { id } });
  if (!audit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const comment = await prisma.auditSectionComment.upsert({
    where: { auditResponseId_coachId_section: { auditResponseId: id, coachId: session.user.id, section } },
    create: { auditResponseId: id, coachId: session.user.id, section, content },
    update: { content },
    include: { coach: { select: { firstName: true, lastName: true } } },
  });

  return NextResponse.json(comment);
}
