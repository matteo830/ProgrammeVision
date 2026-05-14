import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { copyTemplate } from "@/lib/google-drive";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-ghl-secret");
    if (secret !== process.env.GHL_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, password, firstName, lastName, programStartDate } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, firstName, lastName" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "User already exists", userId: existing.id },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        firstName,
        lastName,
        role: "CLIENT",
        clientProfile: {
          create: {
            programStartDate: programStartDate ? new Date(programStartDate) : new Date(),
            programEndDate: programStartDate
              ? new Date(new Date(programStartDate).setMonth(new Date(programStartDate).getMonth() + 6))
              : new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
    });

    // Copy Drive templates for all modules that have one
    const modules = await prisma.courseModule.findMany({
      where: { templateDriveId: { not: null } },
      select: { id: true, title: true, templateDriveId: true },
    });

    await Promise.allSettled(
      modules.map(async (mod) => {
        try {
          const { driveFileId, driveUrl } = await copyTemplate(
            mod.templateDriveId!,
            `${mod.title} — ${firstName} ${lastName}`
          );
          await prisma.clientDocument.create({
            data: { userId: user.id, moduleId: mod.id, driveFileId, driveUrl },
          });
        } catch {
          console.error(`Drive copy failed for module ${mod.id}`);
        }
      })
    );

    return NextResponse.json({
      success: true,
      userId: user.id,
      message: `Account created for ${firstName} ${lastName}`,
    });
  } catch (error) {
    console.error("GHL webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
