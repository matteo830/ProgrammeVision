import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FormationAdminView } from "@/components/admin/formation-admin-view";

export default async function AdminFormationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const courses = await prisma.ghlCourse.findMany({
    orderBy: { order: "asc" },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
            lessons: { orderBy: { order: "asc" } },
            templates: { orderBy: { order: "asc" } },
          },
      },
    },
  });

  return <FormationAdminView initialCourses={courses} />;
}
