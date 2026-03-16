import SiteFooter from "@/components/SiteFooter";
import TopNavbar from "@/components/TopNavbar";
import AdminLoginForm from "@/components/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="page-shell">
      <TopNavbar activePath="/admin/login" />
      <div className="main-content admin-login-page">
        <AdminLoginForm />
      </div>
      <SiteFooter />
    </main>
  );
}
