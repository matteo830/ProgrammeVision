import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FormationSyncView } from "@/components/admin/formation-sync-view";

export default async function AdminFormationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const courses = await prisma.ghlCourse.findMany({
    orderBy: { order: "asc" },
  });

  const lastSync = courses[0]?.syncedAt?.toISOString() ?? null;

  return (
    <FormationSyncView
      initialCourses={courses.map((c) => ({
        ...c,
        syncedAt: c.syncedAt.toISOString(),
      }))}
      lastSync={lastSync}
    />
  );
}
