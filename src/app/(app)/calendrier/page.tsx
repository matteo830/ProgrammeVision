import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CalendrierClient } from "@/components/client/calendrier-client";

export default async function CalendrierPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const now = new Date();

  const [upcoming, past, assignmentRow, coaches, calendarUrl] = await Promise.all([
    prisma.coachingSession.findFirst({
      where: { clientId: userId, scheduledAt: { gt: now } },
      orderBy: { scheduledAt: "asc" },
      include: {
        coach: { select: { firstName: true, lastName: true } },
        actions: true,
        notes: { where: { visibility: "CLIENT_VISIBLE" }, orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.coachingSession.findMany({
      where: { clientId: userId, scheduledAt: { lte: now } },
      orderBy: { scheduledAt: "desc" },
      include: {
        coach: { select: { firstName: true, lastName: true } },
        actions: true,
        notes: { where: { visibility: "CLIENT_VISIBLE" }, orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.coachClientAssignment.findFirst({
      where: { clientId: userId },
      include: { coach: { select: { id: true, firstName: true, lastName: true, ghlCalendarSlug: true } } },
    }),
    prisma.user.findMany({
      where: { role: { in: ["COACH", "ADMIN"] }, isActive: true, NOT: { ghlCalendarSlug: null } },
      select: { id: true, firstName: true, lastName: true, ghlCalendarSlug: true },
      orderBy: { firstName: "asc" },
    }),
    Promise.resolve(process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_URL ?? ""),
  ]);

  const assignedCoach = assignmentRow?.coach ?? null;

  return (
    <CalendrierClient
      coaches={coaches as { id: string; firstName: string; lastName: string; ghlCalendarSlug: string }[]}
      calendarUrl={calendarUrl}
      upcoming={upcoming as Parameters<typeof CalendrierClient>[0]["upcoming"]}
      past={past as Parameters<typeof CalendrierClient>[0]["past"]}
      assignedCoach={assignedCoach as Parameters<typeof CalendrierClient>[0]["assignedCoach"]}
      currentUserId={userId}
    />
  );
}
