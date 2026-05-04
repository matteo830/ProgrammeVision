import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getClientProgress } from "@/lib/progress";
import { DashboardClient } from "@/components/client/dashboard-client";
import { CoachDashboard } from "@/components/coach/coach-dashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role === "COACH") {
    return <CoachDashboard />;
  }

  const [progress, profile, actions, recentGratitude, recentVictory, inspiration] =
    await Promise.all([
      getClientProgress(session.user.id),
      prisma.clientProfile.findUnique({ where: { userId: session.user.id } }),
      prisma.dailyAction.findMany({
        where: { userId: session.user.id, completed: false },
        orderBy: { order: "asc" },
        take: 3,
      }),
      prisma.gratitude.findFirst({
        where: { userId: session.user.id },
        orderBy: { date: "desc" },
      }),
      prisma.weeklyVictory.findFirst({
        where: { userId: session.user.id },
        orderBy: { weekStartDate: "desc" },
      }),
      prisma.inspiration.findFirst({ where: { active: true } }),
    ]);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { firstName: true, lastName: true, avatarUrl: true },
  });

  return (
    <DashboardClient
      user={user!}
      profile={profile}
      progress={progress}
      actions={actions}
      recentGratitude={recentGratitude}
      recentVictory={recentVictory}
      inspiration={inspiration}
    />
  );
}
