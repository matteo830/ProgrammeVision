import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CalendrierClient } from "@/components/client/calendrier-client";

export default async function CalendrierPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [profile, coaches] = await Promise.all([
    prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
      select: { ghlBookingUrl: true },
    }),
    prisma.user.findMany({
      where: {
        role: { in: ["COACH", "ADMIN"] },
        isActive: true,
        NOT: { ghlCalendarSlug: null },
      },
      select: { id: true, firstName: true, lastName: true, ghlCalendarSlug: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  const VISION_CALENDAR_URL = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_URL ?? "";

  return (
    <CalendrierClient
      coaches={coaches as { id: string; firstName: string; lastName: string; ghlCalendarSlug: string }[]}
      calendarUrl={VISION_CALENDAR_URL}
    />
  );
}
