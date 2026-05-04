import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProfilView } from "@/components/client/profil-view";

export default async function ProfilPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { clientProfile: true },
    omit: { password: true },
  });

  if (!user) redirect("/login");

  return <ProfilView user={user} />;
}
