import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ModulesManagerView } from "@/components/coach/modules-manager-view";

export default async function ModulesPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "COACH" && session.user.role !== "ADMIN")) redirect("/dashboard");

  const phases = await prisma.phase.findMany({
    orderBy: { order: "asc" },
    include: { modules: { orderBy: { order: "asc" } } },
  });

  return <ModulesManagerView phases={phases} />;
}
