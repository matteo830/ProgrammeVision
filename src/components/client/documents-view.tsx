"use client";

const C = {
  greenDeep: "#0E3D34", greenDeeper: "#07251F", greenAccent: "#3FA88E",
  goldLight: "#E8C56F",
  ink: "#1A1714", inkSoft: "#5A5247", inkMute: "#9A9080",
  border: "#E8DFC8", cream: "#FAF6EB", white: "#FFFFFF",
};

interface Doc {
  id: string;
  driveUrl: string;
  template: { title: string; module: { title: string } };
}
interface Group { courseId: string; courseTitle: string; docs: Doc[] }

function Mountain() {
  return (
    <svg width="140" height="88" viewBox="0 0 140 88" fill="none"
      style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.25, pointerEvents: "none" }}>
      <polygon points="70,8 140,88 0,88" fill="white" />
      <polygon points="105,32 140,88 70,88" fill="white" opacity="0.5" />
    </svg>
  );
}

function DocCard({ doc }: { doc: Doc }) {
  return (
    <a href={doc.driveUrl} target="_blank" rel="noopener noreferrer"
      style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, border: `1px solid ${C.border}`, background: C.white, textDecoration: "none" }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#E8F0FE", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
        📄
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: "0 0 1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {doc.template.title}
        </p>
        <p style={{ fontSize: 11, color: C.inkMute, margin: 0 }}>
          {doc.template.module.title} · <span style={{ color: C.greenAccent }}>Ouvrir dans Google Drive ↗</span>
        </p>
      </div>
    </a>
  );
}

export function DocumentsView({ grouped }: { grouped: Group[] }) {
  const total = grouped.reduce((s, g) => s + g.docs.length, 0);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 16px 48px", background: C.cream, minHeight: "100vh" }}>
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 20, background: `linear-gradient(160deg, ${C.greenDeep} 0%, ${C.greenDeeper} 100%)`, padding: "28px 28px 24px", marginBottom: 28 }}>
        <Mountain />
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.goldLight, marginBottom: 8 }}>Mes documents</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: C.white, margin: "0 0 4px", lineHeight: 1.2, letterSpacing: "-0.02em" }}>Mes templates</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.67)", margin: 0 }}>
          {total} document{total !== 1 ? "s" : ""} disponible{total !== 1 ? "s" : ""}
        </p>
      </div>

      {grouped.length === 0 ? (
        <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: "48px 32px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📁</div>
          <p style={{ fontSize: 16, fontWeight: 700, color: C.ink, margin: "0 0 8px" }}>Aucun document pour l&apos;instant</p>
          <p style={{ fontSize: 13, color: C.inkMute, margin: 0, lineHeight: 1.6 }}>
            Tes templates personnels apparaîtront ici dès que ton coach les aura configurés.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {grouped.map((g) => (
            <div key={g.courseId}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.inkSoft, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px" }}>
                {g.courseTitle}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {g.docs.map((d) => <DocCard key={d.id} doc={d} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
