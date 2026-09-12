import AdminProductManager from "@/components/admin/AdminProductManager";
import AdminShell from "@/components/admin/AdminShell";

export default function AdminFreshTodayPage() {
  return <AdminShell><AdminProductManager category="dessert" freshTodayOnly /></AdminShell>;
}
