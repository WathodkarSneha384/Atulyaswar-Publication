import Link from "next/link";
import Image from "next/image";
import editorComingImage from "../../../Asset/Coming Soon Page.jpg";

export default function EditorPage() {
  return (
    <main className="editor-coming-page">
      <Image
        src={editorComingImage}
        alt="Editor coming soon background"
        fill
        priority
        className="editor-coming-bg-image"
      />
      <Link href="/journal" className="cross-nav-fab editor-fab" aria-label="Open Journal">
        Open Journal
      </Link>
    </main>
  );
}
