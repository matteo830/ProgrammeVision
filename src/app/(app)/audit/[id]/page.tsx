import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AuditWizard } from "@/components/audit/audit-wizard";

export default async function AuditWizardPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

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

  if (!audit || audit.clientId !== session.user.id) notFound();

  const isReadOnly = audit.status === "SUBMITTED";
  const responses = (audit.responses as Record<string, unknown>) ?? {};

  type CommentRow = typeof audit.comments[number];
  const comments = audit.comments.map((c: CommentRow) => ({
    section: c.section,
    content: c.content,
    coach: c.coach,
  }));

  return (
    <AuditWizard
      auditId={audit.id}
      initialResponses={responses}
      isReadOnly={isReadOnly}
      auditType={audit.type}
      comments={comments}
    />
  );
}
