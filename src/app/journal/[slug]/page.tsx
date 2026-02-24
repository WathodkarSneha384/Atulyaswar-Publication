import { notFound } from "next/navigation";
import JournalShell from "@/components/JournalShell";
import { journalPages, type JournalSlug } from "@/lib/journalContent";

type JournalSubPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function JournalSubPage({ params }: JournalSubPageProps) {
  const { slug } = await params;
  const content = journalPages[slug as JournalSlug];

  if (!content) {
    notFound();
  }

  return (
    <JournalShell activePath={`/journal/${slug}`}>
      <h2>{content.title}</h2>
      <p>{content.description}</p>
      <ul className="journal-list">
        {content.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </JournalShell>
  );
}
