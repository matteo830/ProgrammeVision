import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CoachClientsPage() {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "COACH" && session.user.role !== "ADMIN")) {
    redirect("/dashboard");
  }

  const clients = await prisma.user.findMany({
    where: { role: "CLIENT", isActive: true },
    orderBy: { createdAt: "desc" },
    include: {
      clientProfile: { select: { objective6months: true, programStartDate: true } },
      moduleProgresses: { where: { coachValidated: true }, select: { id: true } },
    },
    omit: { password: true },
  });

  const totalModules = await prisma.module.count();

  const C = {
    greenDeep: "#0E3D34", greenAccent: "#3FA88E", greenSoft: "#E8EFEC",
    gold: "#D4A047", goldLight: "#E8C56F",
    coralStart: "#FF8A6B", coralEnd: "#E8527D",
    cream: "#FAF6EB",
    ink: "#1A1714", inkSoft: "#5A5247", inkMute: "#9A9080",
    border: "#E8DFC8", borderSoft: "#F0E8D4",
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 80px", fontFamily: "'Inter', sans-serif", color: C.ink }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 11, color: C.inkMute, margin: "0 0 2px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Espace coach
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.025em" }}>
            Mes clients
          </h1>
        </div>
        <Link href="/coach/clients/new" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "10px 16px",
          background: `linear-gradient(135deg, ${C.coralStart}, ${C.coralEnd})`,
          color: "#FFFFFF", borderRadius: 12,
          fontSize: 13, fontWeight: 700, textDecoration: "none",
          boxShadow: `0 4px 14px -6px ${C.coralEnd}80`,
        }}>
          + Nouveau client
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <div style={{ background: C.greenDeep, borderRadius: 18, padding: "14px 16px", color: "#FFFFFF" }}>
          <p style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.03em" }}>{clients.length}</p>
          <p style={{ fontSize: 11, color: C.goldLight, margin: "2px 0 0", fontWeight: 600 }}>Clients actifs</p>
        </div>
        <div style={{ background: "#FFFFFF", borderRadius: 18, border: `1px solid ${C.border}`, padding: "14px 16px" }}>
          <p style={{ fontSize: 28, fontWeight: 700, margin: 0, color: C.greenDeep, letterSpacing: "-0.03em" }}>{totalModules}</p>
          <p style={{ fontSize: 11, color: C.inkMute, margin: "2px 0 0", fontWeight: 600 }}>Modules au total</p>
        </div>
      </div>

      {/* Clients list */}
      {clients.length === 0 ? (
        <div style={{ background: "#FFFFFF", borderRadius: 20, border: `1px solid ${C.border}`, padding: "40px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>👥</div>
          <p style={{ fontSize: 14, color: C.inkMute, margin: 0 }}>Aucun client pour le moment</p>
          <Link href="/coach/clients/new" style={{ display: "inline-block", marginTop: 14, fontSize: 13, fontWeight: 700, color: C.coralEnd, textDecoration: "none" }}>
            Ajouter un client →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {clients.map((client) => {
            const progressPct = totalModules > 0
              ? Math.round((client.moduleProgresses.length / totalModules) * 100)
              : 0;
            const initials = `${client.firstName[0]}${client.lastName[0]}`.toUpperCase();

            return (
              <Link key={client.id} href={`/coach/clients/${client.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "#FFFFFF", borderRadius: 18, border: `1px solid ${C.border}`,
                  padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 14,
                  transition: "box-shadow 0.15s",
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${C.coralStart}, ${C.coralEnd})`,
                    color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 15, flexShrink: 0,
                  }}>
                    {initials}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: C.ink, letterSpacing: "-0.01em" }}>
                      {client.firstName} {client.lastName}
                    </p>
                    <p style={{ fontSize: 11.5, color: C.inkMute, margin: "1px 0 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {client.clientProfile?.objective6months ?? client.email}
                    </p>
                    {/* Progress bar */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: C.borderSoft, borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${progressPct}%`, background: progressPct >= 80 ? C.greenDeep : `linear-gradient(90deg, ${C.coralStart}, ${C.coralEnd})`, borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: C.inkMute, flexShrink: 0 }}>{progressPct}%</span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.inkMute} strokeWidth="2" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
