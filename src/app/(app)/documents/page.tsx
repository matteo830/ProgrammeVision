import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DocumentsView } from "@/components/client/documents-view";

export default async function DocumentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const docs = await prisma.clientDocument.findMany({
    where: { userId: session.user.id },
    include: {
      module: {
        select: {
          id: true, title: true,
          course: { select: { id: true, title: true, order: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Group by course
  const byCourse: Record<string, { courseTitle: string; courseOrder: number; docs: typeof docs }> = {};
  for (const doc of docs) {
    const { id, title, order } = doc.module.course;
    if (!byCourse[id]) byCourse[id] = { courseTitle: title, courseOrder: order, docs: [] };
    byCourse[id].docs.push(doc);
  }

  const grouped = Object.entries(byCourse)
    .sort(([, a], [, b]) => a.courseOrder - b.courseOrder)
    .map(([courseId, { courseTitle, docs }]) => ({ courseId, courseTitle, docs }));

  return <DocumentsView grouped={grouped} />;
}
