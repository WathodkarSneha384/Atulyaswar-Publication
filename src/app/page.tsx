import Image from "next/image";
import Link from "next/link";
import drSanikaImage from "../../Asset/Board_Members/Dr. Sanika Goregaonkar.jpg";
import drVilasImage from "../../Asset/Board_Members/Dr. Vilas Jadhav.png";
import profSheetalImage from "../../Asset/Board_Members/Prof. Sheetal More.jpg";
import profSuneeraImage from "../../Asset/Board_Members/Prof. Suneera Kasliwal.jpg";
import ptVidyadharImage from "../../Asset/Board_Members/Pt. Vidyadhar Vyas.jpg";

export default function HomePage() {
  const boardMembers = [
    {
      src: ptVidyadharImage,
      name: "Pt. Vidyadhar Vyas",
      specialization: "Senior Vocalist - Gwalior Gharana",
    },
    {
      src: profSuneeraImage,
      name: "Prof. Suneera Kasliwal",
      specialization: "Senior Artist (Sitar)",
    },
    {
      src: profSheetalImage,
      name: "Prof. Sheetal More",
      specialization: "Senior Academician",
    },
    {
      src: drVilasImage,
      name: "Dr. Vilas Jadhav",
      specialization: "Deputy Librarian and Editorial Board Member",
      imageClassName: "cover-board-image cover-board-image-contain",
    },
    {
      src: drSanikaImage,
      name: "Dr. Sanika Goregaonkar",
      specialization: "Vocalist - Gwalior Gharana",
    },
  ];

  return (
    <main className="cover-page">
      <div className="cover-shell">
        <section className="cover-main-card">
          <h1 className="cover-title">Atulyaswar - A Peer Reviewed Indian Music Journal</h1>
          <p>
            It is with great pride that we introduce Atulyaswar, a dedicated platform
            for scholarship in Indian Classical Music.
          </p>
          <p>
            Rooted in the Guru-Shishya Parampara and adapted for the digital age, this
            journal bridges practitioners and researchers through open access knowledge.
          </p>
          <p>
            We invite scholars and performers alike to explore, contribute, and shape
            new perspectives in the evolving landscape of Indian music research.
          </p>
          <p>
            Guided by a distinguished Editorial Board and Advisors, Atulyaswar is
            enriched by the expertise of eminent scholars and artists who have made
            significant contributions to Indian classical music and academia.
          </p>

          <div className="cover-board-grid">
            {boardMembers.map((member) => (
              <article key={member.name} className="cover-board-item">
                <Image
                  src={member.src}
                  alt={member.name}
                  className={member.imageClassName ?? "cover-board-image"}
                />
                <div className="cover-board-content">
                  <h3>{member.name}</h3>
                  <p>{member.specialization}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="cover-actions cover-actions-outside">
          <Link href="/journal" className="entry-button">
            Open Journal
          </Link>
          <Link href="/editor" className="ghost-button cover-ghost">
            Open Editor
          </Link>
        </div>
      </div>
    </main>
  );
}
