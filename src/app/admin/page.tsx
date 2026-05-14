import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/login");

  const [coaches, clients, inactive] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["COACH", "ADMIN"] }, isActive: true },
      orderBy: { createdAt: "desc" },
      omit: { password: true },
    }),
    prisma.user.findMany({
      where: { role: "CLIENT", isActive: true },
      orderBy: { createdAt: "desc" },
      include: { clientProfile: true, moduleProgresses: { where: { coachValidated: true } } },
      omit: { password: true },
    }),
    prisma.user.findMany({
      where: { isActive: false },
      orderBy: { updatedAt: "desc" },
      omit: { password: true },
    }),
  ]);

  const totalModules = await prisma.module.count();

  const clientsWithStats = clients.map((c) => ({
    ...c,
    validatedModules: c.moduleProgresses.length,
    progressPercent: totalModules > 0 ? Math.round((c.moduleProgresses.length / totalModules) * 100) : 0,
  }));

  return (
    <AdminDashboard
      coaches={coaches}
      clients={clientsWithStats}
      inactive={inactive}
      currentAdminId={session.user.id}
    />
  );
}
