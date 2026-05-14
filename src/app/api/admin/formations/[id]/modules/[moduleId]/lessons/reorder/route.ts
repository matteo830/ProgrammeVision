import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { ids } = await req.json() as { ids: string[] };
  if (!Array.isArray(ids)) return NextResponse.json({ error: "ids requis" }, { status: 400 });

  await prisma.$transaction(
    ids.map((id, index) => prisma.lesson.update({ where: { id }, data: { order: index } }))
  );
  return NextResponse.json({ success: true });
}
