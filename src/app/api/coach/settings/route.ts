import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "COACH" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ghlCalendarSlug } = await req.json();

  // Extract slug from iframe code if full HTML was pasted
  let slug = ghlCalendarSlug?.trim() ?? null;
  if (slug) {
    const match = slug.match(/widget\/booking\/([A-Za-z0-9]+)/);
    if (match) slug = match[1];
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { ghlCalendarSlug: slug || null },
  });

  return NextResponse.json({ ok: true });
}
