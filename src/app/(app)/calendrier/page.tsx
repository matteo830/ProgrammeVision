import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function CalendrierPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
    select: { ghlBookingUrl: true },
  });

  const VISION_CALENDAR_URL = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_URL ?? "";

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Calendrier</h1>

      {/* Agenda collectif VISION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Événements collectifs VISION</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Workshops, lives de groupe et événements communs
          </p>
        </div>
        {VISION_CALENDAR_URL ? (
          <iframe
            src={VISION_CALENDAR_URL}
            className="w-full"
            height="400"
            frameBorder="0"
            scrolling="no"
          />
        ) : (
          <div className="p-8 text-center text-gray-400 text-sm">
            Calendrier collectif à configurer (NEXT_PUBLIC_GOOGLE_CALENDAR_URL)
          </div>
        )}
      </div>

      {/* Réservation coaching individuel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Coaching individuel</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Réserve ta prochaine séance avec ton coach
          </p>
        </div>
        {profile?.ghlBookingUrl ? (
          <iframe
            src={profile.ghlBookingUrl}
            className="w-full"
            height="500"
            frameBorder="0"
          />
        ) : (
          <div className="p-8 text-center text-gray-400 text-sm">
            Lien de réservation non configuré.
            <br />
            <span className="text-xs">Contacte ton coach pour obtenir ton lien.</span>
          </div>
        )}
      </div>
    </div>
  );
}
