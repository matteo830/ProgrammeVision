import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QuestionsView } from "@/components/client/questions-view";

export default async function QuestionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const questions = await prisma.question.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { firstName: true, lastName: true, role: true } },
        },
      },
    },
  });

  return <QuestionsView initialQuestions={questions} />;
}
