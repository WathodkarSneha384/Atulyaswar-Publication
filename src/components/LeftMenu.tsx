import Link from "next/link";

type LeftMenuProps = {
  active: "home" | "journal" | "editor";
};

export default function LeftMenu({ active }: LeftMenuProps) {
  return (
    <aside className="left-nav" aria-label="Primary Navigation">
      <h2 className="left-nav-title">Navigate</h2>
      <Link href="/" className={`left-nav-link ${active === "home" ? "active" : ""}`}>
        Home
      </Link>
      <Link
        href="/journal"
        className={`left-nav-link ${active === "journal" ? "active" : ""}`}
      >
        Journal
      </Link>
      <Link href="/editor" className={`left-nav-link ${active === "editor" ? "active" : ""}`}>
        Editor
      </Link>
    </aside>
  );
}
