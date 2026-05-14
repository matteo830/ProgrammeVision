import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchGhlCourses, buildAccessUrl } from "@/lib/ghl-courses";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const courses = await fetchGhlCourses();

    await Promise.all(
      courses.map((c, i) =>
        prisma.ghlCourse.upsert({
          where: { ghlId: c.id },
          update: {
            title: c.title,
            description: c.description ?? null,
            imageUrl: c.thumbnailUrl ?? c.imageUrl ?? null,
            accessUrl: buildAccessUrl(c),
            order: i,
            isActive: true,
            syncedAt: new Date(),
          },
          create: {
            ghlId: c.id,
            title: c.title,
            description: c.description ?? null,
            imageUrl: c.thumbnailUrl ?? c.imageUrl ?? null,
            accessUrl: buildAccessUrl(c),
            order: i,
          },
        })
      )
    );

    return NextResponse.json({ synced: courses.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const courses = await prisma.ghlCourse.findMany({
    orderBy: { order: "asc" },
  });
  const lastSync = courses[0]?.syncedAt ?? null;

  return NextResponse.json({ courses, lastSync });
}
