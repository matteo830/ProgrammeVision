import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  const courses = await prisma.ghlCourse.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { title, description, imageUrl, accessUrl } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Le titre est requis" }, { status: 400 });

  const count = await prisma.ghlCourse.count();
  const course = await prisma.ghlCourse.create({
    data: {
      ghlId: `manual-${Date.now()}`,
      title: title.trim(),
      description: description?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      accessUrl: accessUrl?.trim() || null,
      order: count,
    },
  });

  return NextResponse.json(course, { status: 201 });
}
