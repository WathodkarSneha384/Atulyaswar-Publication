import SiteFooter from "@/components/SiteFooter";
import TopNavbar from "@/components/TopNavbar";

export default function JournalReadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="page-shell">
      <TopNavbar activePath="/journal/current-issue" />
      <div className="read-page-content">{children}</div>
      <SiteFooter />
    </main>
  );
}
