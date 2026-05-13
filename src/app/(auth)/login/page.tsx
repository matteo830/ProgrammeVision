"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

const VisionLogo = () => (
  <div style={{ width: 44, height: 44, borderRadius: 11, background: "#0E3D34", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#D4A047">
      <path d="M12 2 L4 22 L20 22 Z" opacity="0.4" />
      <path d="M12 7 L7 20 L17 20 Z" />
    </svg>
  </div>
);

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("reset") === "success") {
      setSuccess("Mot de passe réinitialisé. Vous pouvez vous connecter.");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      if (result.error.includes("ACCOUNT_DISABLED")) {
        setError("Votre compte a été désactivé. Contactez votre coach.");
      } else {
        setError("Email ou mot de passe incorrect.");
      }
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0E3D34", fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", color: "#FFFFFF" }}>

      {/* Hero vert */}
      <div style={{ padding: "56px 28px 40px", position: "relative", overflow: "hidden" }}>
        <svg width="260" height="180" viewBox="0 0 260 180" style={{ position: "absolute", top: 0, right: -30, opacity: 0.22 }}>
          <path d="M0 140 L50 90 L90 120 L130 55 L185 100 L260 60 L260 180 L0 180 Z" fill="#D4A047" />
          <path d="M0 155 L35 115 L70 135 L110 90 L165 125 L220 100 L260 115 L260 180 L0 180 Z" fill="#3FA88E" />
          <circle cx="200" cy="45" r="12" fill="#E8C56F" />
          <path d="M130 55 L127 40 L133 40 Z" fill="#D4A047" />
        </svg>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 64, position: "relative" }}>
          <VisionLogo />
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.06em", color: "#D4A047" }}>VISION</span>
        </div>

        <div style={{ position: "relative" }}>
          <p style={{ fontSize: 11, color: "#E8C56F", margin: "0 0 8px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Ton GPS business
          </p>
          <h1 style={{ fontSize: 30, fontWeight: 700, margin: 0, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#FFFFFF" }}>
            Reprends ta route<br />vers l&apos;objectif.
          </h1>
        </div>
      </div>

      {/* Sheet form */}
      <div style={{ flex: 1, background: "#FAF6EB", color: "#1A1714", borderRadius: "32px 32px 0 0", padding: "28px 24px 40px", boxShadow: "0 -12px 32px -8px rgba(0,0,0,0.15)" }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "#E8DFC8", margin: "0 auto 22px" }} />

        {success && (
          <div style={{ background: "#E8EFEC", border: "1px solid #D7E5DE", borderRadius: 12, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#0E3D34", fontWeight: 500 }}>
            {success}
          </div>
        )}
        {error && (
          <div style={{ background: "#FBE7E7", border: "1px solid #FBCFCF", borderRadius: 12, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#C84A4A", fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Email */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#5A5247", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6, marginLeft: 4 }}>Email</label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9A9080", display: "flex" }}>
                <Mail size={16} />
              </div>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="ton@email.com" autoComplete="email"
                style={{ width: "100%", padding: "13px 14px 13px 40px", background: "#FFFFFF", border: "1px solid #E8DFC8", borderRadius: 14, fontSize: 14, color: "#1A1714", fontFamily: "inherit" }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#5A5247", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6, marginLeft: 4 }}>Mot de passe</label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9A9080", display: "flex" }}>
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password"
                style={{ width: "100%", padding: "13px 44px 13px 40px", background: "#FFFFFF", border: "1px solid #E8DFC8", borderRadius: 14, fontSize: 14, color: "#1A1714", fontFamily: "inherit" }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#9A9080", padding: 6, cursor: "pointer", display: "flex" }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: "right", marginTop: -4, marginRight: 4 }}>
            <Link href="/forgot-password" style={{ fontSize: 12, color: "#E8527D", fontWeight: 600, textDecoration: "none" }}>
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit" disabled={loading}
            style={{ width: "100%", padding: "14px 18px", background: "linear-gradient(135deg, #FF8A6B 0%, #F46B7A 55%, #E8527D 100%)", color: "#FFFFFF", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 22px -10px rgba(232,82,125,0.5)", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Connexion..." : "Se connecter"}
            {!loading && <ArrowRight size={14} />}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "#9A9080", lineHeight: 1.5 }}>
          Pas encore client ?{" "}
          <a href="#" style={{ color: "#0E3D34", fontWeight: 700, textDecoration: "none" }}>Contacte ton coach</a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0E3D34" }} />}>
      <LoginForm />
    </Suspense>
  );
}
