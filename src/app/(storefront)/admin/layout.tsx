import { redirect } from "next/navigation";

import { isAdminEmail } from "@/lib/auth/admin";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getSessionUser();
  if (!user || !isAdminEmail(user.email)) {
    redirect("/login?returnTo=%2Fadmin");
  }

  return children;
}
