import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getClientProgress } from "@/lib/progress";
import { notFound } from "next/navigation";
import { ClientDetailView } from "@/components/coach/client-detail-view";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "COACH" && session.user.role !== "ADMIN")) redirect("/dashboard");

  const { id } = await params;

  const client = await prisma.user.findUnique({
    where: { id, role: "CLIENT" },
    include: { clientProfile: true },
    omit: { password: true },
  });

  if (!client) notFound();

  const [progress, notes, questions, sessions] = await Promise.all([
    getClientProgress(id),
    prisma.coachingNote.findMany({
      where: { clientId: id },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { firstName: true, lastName: true, role: true } } },
    }),
    prisma.question.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { firstName: true, lastName: true } },
        replies: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { firstName: true, lastName: true, role: true } } },
        },
      },
    }),
    prisma.coachingSession.findMany({
      where: { clientId: id },
      orderBy: { scheduledAt: "desc" },
      include: { actions: { orderBy: { createdAt: "asc" } } },
    }),
  ]);

  return (
    <ClientDetailView
      client={client as {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatarUrl: string | null;
        clientProfile: {
          objective6months: string | null;
          currentRevenue: number | null;
          targetRevenue: number | null;
          programStartDate: Date | null;
          ghlBookingUrl: string | null;
        } | null;
      }}
      progress={progress}
      notes={notes}
      questions={questions}
      sessions={sessions}
    />
  );
}
