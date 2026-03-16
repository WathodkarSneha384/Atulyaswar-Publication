import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import TopNavbar from "@/components/TopNavbar";
import AdminDashboard from "@/components/AdminDashboard";
import { ADMIN_COOKIE_NAME, isValidAdminKey } from "@/lib/adminAuth";

export default async function AdminManuscriptsPage() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value ?? "";

  if (!isValidAdminKey(adminCookie)) {
    redirect("/admin/login");
  }

  return (
    <main className="page-shell">
      <TopNavbar activePath="/admin/manuscripts" />
      <div className="main-content">
        <AdminDashboard />
      </div>
      <SiteFooter />
    </main>
  );
}
