import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AuditEvolution } from "@/components/audit/audit-evolution";

export default async function AuditEvolutionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const audits = await prisma.auditResponse.findMany({
    where: { clientId: session.user.id, status: "SUBMITTED" },
    select: { type: true, submittedAt: true, responses: true },
    orderBy: { submittedAt: "asc" },
  });

  if (audits.length < 2) redirect("/audit");

  type AuditRow = typeof audits[number];
  const data = audits.map((a: AuditRow) => ({
    type: a.type as "INITIAL" | "MID" | "FINAL",
    submittedAt: a.submittedAt!.toISOString(),
    responses: (a.responses as Record<string, unknown>) ?? {},
  }));

  return <AuditEvolution audits={data} />;
}
