import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getClientProgress } from "@/lib/progress";
import { FormationView } from "@/components/client/formation-view";

export default async function FormationPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const progress = await getClientProgress(session.user.id);

  return <FormationView progress={progress} />;
}
