"use client";

import { useState } from "react";

const C = {
  greenDeep: "#0E3D34",
  greenSoft: "#E8EFEC",
  greenAccent: "#3FA88E",
  gold: "#D4A047",
  goldLight: "#E8C56F",
  coralStart: "#FF8A6B",
  coralEnd: "#E8527D",
  cream: "#FAF6EB",
  ink: "#1A1714",
  inkSoft: "#5A5247",
  inkMute: "#9A9080",
  border: "#E8DFC8",
  borderSoft: "#F0E8D4",
  white: "#FFFFFF",
};

interface GhlCourse {
  id: string;
  ghlId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  accessUrl: string | null;
  order: number;
  isActive: boolean;
  syncedAt: string;
}

interface FormationSyncViewProps {
  initialCourses: GhlCourse[];
  lastSync: string | null;
}

export function FormationSyncView({
  initialCourses,
  lastSync: initialLastSync,
}: FormationSyncViewProps) {
  const [courses, setCourses] = useState(initialCourses);
  const [lastSync, setLastSync] = useState(initialLastSync);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(
    null
  );

  async function triggerSync() {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/ghl-sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ text: `Erreur : ${data.error}`, ok: false });
      } else {
        setMessage({ text: `Synchronisation réussie — ${data.synced} cours importés`, ok: true });
        // Refresh the list
        const refresh = await fetch("/api/admin/ghl-sync");
        const refreshed = await refresh.json();
        setCourses(refreshed.courses ?? []);
        setLastSync(refreshed.lastSync ?? new Date().toISOString());
      }
    } catch {
      setMessage({ text: "Erreur réseau lors de la synchronisation", ok: false });
    } finally {
      setSyncing(false);
    }
  }

  function formatDate(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "0 auto",
        padding: "28px 16px 80px",
        fontFamily: "'Inter', sans-serif",
        color: C.ink,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, color: C.inkMute, margin: "0 0 2px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Administration
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.025em" }}>
          Contenus de formation
        </h1>
      </div>

      {/* Sync card */}
      <div
        style={{
          background: C.white,
          borderRadius: 20,
          border: `1px solid ${C.border}`,
          padding: "22px 22px",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: C.greenDeep,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            🔄
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
              Synchronisation GoHighLevel
            </p>
            <p style={{ fontSize: 12, color: C.inkMute, margin: "2px 0 0" }}>
              Dernière synchro : {formatDate(lastSync)}
            </p>
          </div>
        </div>

        <div
          style={{
            background: C.greenSoft,
            borderRadius: 12,
            padding: "12px 14px",
            marginBottom: 16,
            borderLeft: `3px solid ${C.greenAccent}`,
          }}
        >
          <p style={{ fontSize: 12, color: C.greenDeep, margin: 0, lineHeight: 1.6 }}>
            La synchronisation récupère tous les cours publiés dans GoHighLevel
            et les affiche aux clients dans la page Formation. Les clients voient
            la version précédente jusqu&apos;à ce que tu déclenches une nouvelle synchro.
          </p>
        </div>

        {message && (
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: message.ok ? C.greenAccent : C.coralEnd,
              marginBottom: 12,
            }}
          >
            {message.text}
          </p>
        )}

        <button
          onClick={triggerSync}
          disabled={syncing}
          style={{
            width: "100%",
            padding: "13px 16px",
            background: syncing
              ? C.border
              : `linear-gradient(135deg, ${C.coralStart}, ${C.coralEnd})`,
            color: syncing ? C.inkMute : C.white,
            border: "none",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            cursor: syncing ? "default" : "pointer",
            fontFamily: "inherit",
            transition: "opacity 0.15s",
          }}
        >
          {syncing ? "Synchronisation en cours…" : "Synchroniser avec GHL"}
        </button>
      </div>

      {/* Course list */}
      <div>
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: C.inkSoft,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          Cours actuels ({courses.length})
        </p>

        {courses.length === 0 ? (
          <div
            style={{
              background: C.white,
              borderRadius: 16,
              border: `1px solid ${C.border}`,
              padding: "32px 24px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 14, color: C.inkMute, margin: 0 }}>
              Aucun cours synchronisé. Clique sur &quot;Synchroniser avec GHL&quot; pour importer les cours.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {courses.map((course) => (
              <div
                key={course.id}
                style={{
                  background: C.white,
                  borderRadius: 16,
                  border: `1px solid ${C.border}`,
                  padding: "16px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 10,
                    background: C.borderSoft,
                    flexShrink: 0,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {course.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span style={{ fontSize: 24 }}>📚</span>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 3px", color: C.ink }}>
                    {course.title}
                  </p>
                  {course.description && (
                    <p
                      style={{
                        fontSize: 12,
                        color: C.inkMute,
                        margin: "0 0 4px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {course.description}
                    </p>
                  )}
                  {course.accessUrl && (
                    <a
                      href={course.accessUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 11, color: C.greenAccent }}
                    >
                      ↗ Vérifier le lien d&apos;accès
                    </a>
                  )}
                </div>

                {/* Order badge */}
                <div
                  style={{
                    flexShrink: 0,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: C.greenDeep,
                    color: C.goldLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {course.order + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
