import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UNLOCK_WEEKS } from "@/lib/audit-data";
import { AuditType } from "@prisma/client";

function getAvailabilityStatus(
  type: AuditType,
  existingAudit: { status: string } | null,
  programStartDate: Date | null
): "SUBMITTED" | "DRAFT" | "AVAILABLE" | "LOCKED" {
  if (existingAudit) return existingAudit.status as "SUBMITTED" | "DRAFT";

  const unlockWeek = UNLOCK_WEEKS[type];
  if (unlockWeek === 0) return "AVAILABLE";

  if (!programStartDate) return "LOCKED";
  const weeksPassed = Math.floor(
    (Date.now() - programStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  return weeksPassed >= unlockWeek ? "AVAILABLE" : "LOCKED";
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [audits, profile] = await Promise.all([
    prisma.auditResponse.findMany({
      where: { clientId: userId },
      include: { comments: { select: { section: true } } },
    }),
    prisma.clientProfile.findUnique({ where: { userId }, select: { programStartDate: true } }),
  ]);

  type AuditRow = typeof audits[number];
  const auditMap = Object.fromEntries(audits.map((a: AuditRow) => [a.type, a]));
  const programStartDate = profile?.programStartDate ?? null;

  const result = (["INITIAL", "MID", "FINAL"] as AuditType[]).map((type) => {
    const audit = auditMap[type] ?? null;
    const availability = getAvailabilityStatus(type, audit, programStartDate);
    return {
      type,
      id: audit?.id ?? null,
      status: availability,
      submittedAt: audit?.submittedAt ?? null,
      coachCommentCount: audit?.comments.length ?? 0,
    };
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { type } = await req.json() as { type: AuditType };

  if (!["INITIAL", "MID", "FINAL"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const audit = await prisma.auditResponse.upsert({
    where: { clientId_type: { clientId: userId, type } },
    create: { clientId: userId, type, status: "DRAFT", responses: {} },
    update: {},
  });

  return NextResponse.json(audit);
}
