import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import JournalShell from "@/components/JournalShell";
import { getAllBoardMemberSlugs, getBoardMemberBySlug } from "@/data/boardMembers";

type BoardMemberPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllBoardMemberSlugs().map((slug) => ({ slug }));
}

export default async function BoardMemberPage({ params }: BoardMemberPageProps) {
  const { slug } = await params;
  const member = getBoardMemberBySlug(slug);

  if (!member) {
    notFound();
  }

  return (
    <JournalShell activePath="/journal/editorial-board">
      <div className="board-profile-page">
        <Link href="/journal/editorial-board" className="board-profile-back">
          ← Back to Board Members
        </Link>

        <header className="board-profile-hero">
          <div className="board-profile-photo-wrap">
            <Image
              src={member.image}
              alt={member.name}
              className={member.imageClassName ?? "board-photo"}
              priority
            />
          </div>
          <div className="board-profile-hero-content">
            <p className="board-profile-label">Editorial Board</p>
            <h1>{member.name}</h1>
            <p className="board-profile-role">{member.role}</p>
            <div className="board-profile-details">
              {member.details.map((detail) => (
                <p key={`${member.slug}-hero-${detail}`}>{detail}</p>
              ))}
            </div>
          </div>
        </header>

        <section className="board-profile-intro">
          <h2>Short Bio</h2>
          <p>{member.intro}</p>
        </section>

        {member.sections.map((section) => (
          <section className="board-profile-section" key={`${member.slug}-${section.title}`}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={`${section.title}-${paragraph.slice(0, 40)}`}>{paragraph}</p>
            ))}
            {section.listItems && section.listItems.length > 0 ? (
              <ul className="board-profile-list">
                {section.listItems.map((item) => (
                  <li key={`${section.title}-${item.slice(0, 40)}`}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        {member.awards && member.awards.length > 0 ? (
          <section className="board-profile-section board-profile-awards">
            <h2>Awards & Recognition</h2>
            <ul className="board-profile-list">
              {member.awards.map((award) => (
                <li key={`${member.slug}-award-${award.slice(0, 40)}`}>{award}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </JournalShell>
  );
}
