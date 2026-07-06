import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminSetupForm } from "@/components/admin/admin-setup-form";

export const dynamic = "force-dynamic";

export default async function AdminSetupPage() {
  const adminExists = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (adminExists) redirect("/login");

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--cream)" }}>
      <div className="w-full max-w-md rounded-[20px] p-8 shadow-sm"
        style={{ background: "#fff", border: "1px solid var(--border)" }}>
        {/* En-tête */}
        <div className="mb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] mb-1.5"
            style={{ color: "var(--green-accent)" }}>
            Première installation
          </p>
          <h1 className="text-[22px] font-extrabold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>
            Configuration initiale
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--ink-mute)" }}>
            Créez le premier compte administrateur pour accéder à la plateforme.
          </p>
        </div>
        <AdminSetupForm />
      </div>
    </div>
  );
}
