import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COACH") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar role="COACH" />
      <main className="md:ml-64 min-h-screen">{children}</main>
    </div>
  );
}
