"use client";

const C = {
  greenDeep: "#0E3D34",
  greenDeeper: "#07251F",
  green3: "#3FA88E",
  gold: "#D4A047",
  goldLight: "#E8C56F",
  coralStart: "#FF8A6B",
  coralEnd: "#E8527D",
  ink: "#1A1714",
  inkSoft: "#5A5247",
  inkMute: "#9A9080",
  border: "#E8DFC8",
  borderSoft: "#F0E8D4",
  cream: "#FAF6EB",
  white: "#FFFFFF",
};

export interface GhlCourse {
  id: string;
  ghlId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  accessUrl: string | null;
  order: number;
}

interface FormationViewProps {
  courses: GhlCourse[];
}

function MountainDecoration() {
  return (
    <svg
      width="160"
      height="100"
      viewBox="0 0 160 100"
      fill="none"
      style={{
        position: "absolute",
        bottom: 0,
        right: 0,
        opacity: 0.3,
        pointerEvents: "none",
      }}
    >
      <polygon points="80,10 160,100 0,100" fill="white" />
      <polygon points="120,35 160,100 80,100" fill="white" opacity="0.5" />
      <polygon points="30,55 80,100 0,100" fill="white" opacity="0.4" />
    </svg>
  );
}

function HeroCard({ count }: { count: number }) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 20,
        background: `linear-gradient(160deg, ${C.greenDeep} 0%, ${C.greenDeeper} 100%)`,
        padding: "28px 28px 24px",
        marginBottom: 28,
      }}
    >
      <MountainDecoration />
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: C.goldLight,
          marginBottom: 8,
        }}
      >
        Ma formation
      </div>
      <h1
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: C.white,
          margin: "0 0 6px",
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}
      >
        Méthode VISION
      </h1>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.67)", margin: 0 }}>
        {count} cours disponible{count !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

function CourseCard({ course }: { course: GhlCourse }) {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 20,
        border: `1px solid ${C.border}`,
        overflow: "hidden",
      }}
    >
      {/* Thumbnail */}
      {course.imageUrl && (
        <div
          style={{
            width: "100%",
            height: 160,
            overflow: "hidden",
            background: C.borderSoft,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={course.imageUrl}
            alt={course.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      {/* Body */}
      <div style={{ padding: "18px 20px 20px" }}>
        {/* Order badge */}
        <div style={{ marginBottom: 10 }}>
          <span
            style={{
              display: "inline-block",
              padding: "3px 10px",
              borderRadius: 99,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: `${C.greenDeep}18`,
              color: C.greenDeep,
              border: `1px solid ${C.greenDeep}25`,
            }}
          >
            Cours {course.order + 1}
          </span>
        </div>

        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: C.ink,
            margin: "0 0 8px",
            lineHeight: 1.3,
          }}
        >
          {course.title}
        </h2>

        {course.description && (
          <p
            style={{
              fontSize: 13,
              color: C.inkSoft,
              margin: "0 0 18px",
              lineHeight: 1.55,
            }}
          >
            {course.description}
          </p>
        )}

        {course.accessUrl ? (
          <a
            href={course.accessUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 22px",
              borderRadius: 99,
              background: `linear-gradient(135deg, ${C.coralStart}, ${C.coralEnd})`,
              color: C.white,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
              boxShadow: "0 2px 12px rgba(232,82,125,0.28)",
            }}
          >
            Accéder au cours
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke={C.white}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        ) : (
          <span
            style={{
              display: "inline-block",
              padding: "11px 22px",
              borderRadius: 99,
              background: C.borderSoft,
              color: C.inkMute,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Bientôt disponible
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 20,
        border: `1px solid ${C.border}`,
        padding: "48px 32px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 16 }}>📚</div>
      <p
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: C.ink,
          margin: "0 0 8px",
        }}
      >
        Contenus en cours de préparation
      </p>
      <p style={{ fontSize: 13, color: C.inkMute, margin: 0, lineHeight: 1.6 }}>
        Tes cours seront disponibles très prochainement.
        <br />
        N&apos;hésite pas à contacter ton coach si tu as des questions.
      </p>
    </div>
  );
}

export function FormationView({ courses }: FormationViewProps) {
  return (
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "28px 16px 48px",
        background: C.cream,
        minHeight: "100vh",
      }}
    >
      <HeroCard count={courses.length} />

      {courses.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
