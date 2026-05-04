import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { VictoiresView } from "@/components/client/victoires-view";

export default async function VictoiresPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [victories, gratitudes] = await Promise.all([
    prisma.weeklyVictory.findMany({
      where: { userId: session.user.id },
      orderBy: { weekStartDate: "desc" },
    }),
    prisma.gratitude.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 30,
    }),
  ]);

  return <VictoiresView victories={victories} gratitudes={gratitudes} />;
}
