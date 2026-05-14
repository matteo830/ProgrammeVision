import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CoachesView } from "@/components/coach/coaches-view";

export default async function CoachesPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/dashboard");

  const coaches = await prisma.user.findMany({
    where: { role: { in: ["COACH", "ADMIN"] } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, firstName: true, lastName: true, email: true,
      role: true, isActive: true, createdAt: true,
      ghlCalendarSlug: true,
      assignedClients: { select: { id: true } },
    },
  });

  return <CoachesView coaches={coaches} currentUserId={session.user.id} />;
}
