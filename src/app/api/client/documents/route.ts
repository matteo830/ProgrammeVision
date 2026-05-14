import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const docs = await prisma.clientDocument.findMany({
    where: { userId: session.user.id },
    include: {
      template: {
        include: {
          module: {
            select: {
              id: true,
              title: true,
              course: { select: { id: true, title: true, order: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(docs);
}
