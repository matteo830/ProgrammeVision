import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminSetupForm } from "@/components/admin/admin-setup-form";

export default async function AdminSetupPage() {
  const adminExists = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (adminExists) redirect("/login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Configuration initiale</h1>
        <p className="text-sm text-gray-500 mb-6">Créez le premier compte administrateur.</p>
        <AdminSetupForm />
      </div>
    </div>
  );
}
