import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AuditHub } from "@/components/audit/audit-hub";
import { UNLOCK_WEEKS } from "@/lib/audit-data";
import { AuditType } from "@prisma/client";

function getStatus(
  type: AuditType,
  existing: { status: string } | null,
  programStartDate: Date | null
): "SUBMITTED" | "DRAFT" | "AVAILABLE" | "LOCKED" {
  if (existing) return existing.status as "SUBMITTED" | "DRAFT";
  const unlockWeek = UNLOCK_WEEKS[type];
  if (unlockWeek === 0) return "AVAILABLE";
  if (!programStartDate) return "LOCKED";
  const weeks = Math.floor((Date.now() - programStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return weeks >= unlockWeek ? "AVAILABLE" : "LOCKED";
}

export default async function AuditPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [auditRows, profile] = await Promise.all([
    prisma.auditResponse.findMany({
      where: { clientId: userId },
      include: { comments: { select: { id: true } } },
    }),
    prisma.clientProfile.findUnique({ where: { userId }, select: { programStartDate: true } }),
  ]);

  type AuditRow = typeof auditRows[number];
  const auditMap = Object.fromEntries(auditRows.map((a: AuditRow) => [a.type, a]));
  const programStartDate = profile?.programStartDate ?? null;

  const audits = (["INITIAL", "MID", "FINAL"] as AuditType[]).map((type) => {
    const row = auditMap[type] ?? null;
    return {
      type,
      id: row?.id ?? null,
      status: getStatus(type, row, programStartDate),
      submittedAt: row?.submittedAt?.toISOString() ?? null,
      coachCommentCount: row?.comments.length ?? 0,
    };
  });

  return <AuditHub audits={audits} />;
}
