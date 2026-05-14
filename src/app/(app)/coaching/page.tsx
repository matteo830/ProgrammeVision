import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CoachingClientView } from "@/components/client/coaching-client-view";

export default async function CoachingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const now = new Date();

  const [notes, upcoming, past, assignmentRow, coaches, currentUser] = await Promise.all([
    prisma.coachingNote.findMany({
      where: { clientId: userId, visibility: "CLIENT_VISIBLE" },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { firstName: true, lastName: true, role: true } } },
    }),
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
    prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true, phone: true },
    }),
  ]);

  return (
    <CoachingClientView
      initialNotes={notes}
      userId={userId}
      upcoming={upcoming as Parameters<typeof CoachingClientView>[0]["upcoming"]}
      past={past as Parameters<typeof CoachingClientView>[0]["past"]}
      assignedCoach={assignmentRow?.coach ?? null}
      coaches={coaches as Parameters<typeof CoachingClientView>[0]["coaches"]}
      clientFirstName={currentUser?.firstName ?? ""}
      clientLastName={currentUser?.lastName ?? ""}
      clientEmail={currentUser?.email ?? ""}
      clientPhone={currentUser?.phone ?? null}
    />
  );
}
