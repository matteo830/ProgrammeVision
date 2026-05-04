import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CoachingClientView } from "@/components/client/coaching-client-view";

export default async function CoachingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const notes = await prisma.coachingNote.findMany({
    where: {
      clientId: session.user.id,
      visibility: "CLIENT_VISIBLE",
    },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { firstName: true, lastName: true, role: true } },
    },
  });

  return <CoachingClientView initialNotes={notes} userId={session.user.id} />;
}
