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
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              progresses: {
                where: { userId: session.user.id },
                select: { status: true },
              },
            },
          },
        },
      },
    },
  });

  const serialized = courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    imageUrl: c.imageUrl,
    accessUrl: c.accessUrl,
    order: c.order,
    modules: c.modules.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      lessons: m.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        order: l.order,
        status: (l.progresses[0]?.status ?? "NOT_STARTED") as "NOT_STARTED" | "IN_PROGRESS" | "DONE",
      })),
    })),
  }));

  return <FormationView courses={serialized} />;
}
