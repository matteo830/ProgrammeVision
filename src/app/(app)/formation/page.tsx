import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FormationView } from "@/components/client/formation-view";

export default async function FormationPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const courses = await prisma.ghlCourse.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  return (
    <FormationView
      courses={courses.map((c) => ({
        id: c.id,
        ghlId: c.ghlId,
        title: c.title,
        description: c.description,
        imageUrl: c.imageUrl,
        accessUrl: c.accessUrl,
        order: c.order,
      }))}
    />
  );
}
