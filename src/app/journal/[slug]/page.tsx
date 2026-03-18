import Image from "next/image";
import { notFound } from "next/navigation";
import ContactUsForm from "@/components/ContactUsForm";
import ArchiveIssuesClient from "@/components/ArchiveIssuesClient";
import IssueEntrySubmissionForm from "@/components/IssueEntrySubmissionForm";
import SubmitManuscriptForm from "@/components/SubmitManuscriptForm";
import JournalShell from "@/components/JournalShell";
import { listApprovedIssueEntriesForIssue } from "@/lib/issueEntrySubmissionStore";
import { getArchiveIssues, getCurrentIssue, listIssues } from "@/lib/issueStore";
import { listManuscripts } from "@/lib/manuscriptStore";
import { getVolumeIssueByYearAndIssue, getVolumeIssueDetails } from "@/lib/volumeIssue";
import archiveDummyData from "@/data/archiveDummyData.json";
import drSanikaImage from "../../../../Asset/Board_Members/Dr. Sanika Goregaonkar.jpg";
import drVilasImage from "../../../../Asset/Board_Members/Dr. Vilas Jadhav.png";
import profSheetalImage from "../../../../Asset/Board_Members/Prof. Sheetal More.jpg";
import profSuneeraImage from "../../../../Asset/Board_Members/Prof. Suneera Kasliwal.jpg";
import ptVidyadharImage from "../../../../Asset/Board_Members/Pt. Vidyadhar Vyas.jpg";

type JournalSubPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function JournalSubPage({ params }: JournalSubPageProps) {
  const { slug } = await params;

  return (
    <JournalShell activePath={`/journal/${slug}`}>
      {await renderMenuPage(slug)}
    </JournalShell>
  );
}

async function renderMenuPage(slug: string) {
  if (slug === "about") {
    return (
      <>
        <section className="about-page-wrap">
          <h2 className="menu-page-title">About</h2>
          <div className="about-intro-card">
            <p>
              It is with great pride that we introduce Atulyaswar – A peer reviewed,
              Indian Music Journal dedicated to the research in Indian Classical
              Music.
            </p>
          </div>

          <div className="about-content-grid">
            <article className="about-content-card">
              <p>
                The world of Indian Classical Music is an intricate tapestry of sound,
                spirituality, and mathematics. For centuries, this art form has
                flourished through the Guru-Shishya Parampara, an oral tradition that
                has preserved the sanctity of the Swar and Laya.
              </p>
              <p>
                However, as we navigate the digital age, the need for a centralized,
                scholarly, and accessible platform for intellectual discussion has
                never been more pressing. This journal serves as a bridge between the
                practitioner and the theorist.
              </p>
              <p>
                By operating as an open-access platform, we ensure that knowledge is
                not confined to the ivory towers of academia but is freely available
                to musicians, students, and enthusiasts worldwide. The journal will
                publish two issues per year.
              </p>
            </article>

            <aside className="about-highlight-card">
              <h3>Our Vision</h3>
              <p>
                Through peer-reviewed research papers, we aim to document the
                &apos;living&apos; nature of our music.
              </p>
              <p>
                We invite scholars and performers alike to submit their findings,
                challenging old paradigms and suggesting new ways to perceive the
                infinite possibilities within a single note.
              </p>
            </aside>
          </div>
        </section>
      </>
    );
  }

  if (slug === "editorial-board") {
    return (
      <>
        <h2 className="menu-page-title">Board Members</h2>
        <div className="board-list">
          <article className="board-item">
            <div className="board-photo-wrap">
              <Image
                src={ptVidyadharImage}
                alt="Pt. Vidyadhar Vyas"
                className="board-photo"
              />
            </div>
            <h3>Pt. Vidyadhar Vyas</h3>
            <p className="board-role">Editorial Advisor</p>
            <p className="board-specialization">Senior Vocalist – Gwalior Gharana</p>
            <ul className="board-meta">
              <li>Ex. Vice Chancellor - Bhatkhande Music Institute, Lucknow</li>
              <li>Ex. Executive Director – ITC Sangeet Research Academy, Kolkata</li>
            </ul>
          </article>

          <article className="board-item">
            <div className="board-photo-wrap">
              <Image
                src={profSuneeraImage}
                alt="Prof. Suneera Kasliwal"
                className="board-photo"
              />
            </div>
            <h3>Prof. Suneera Kasliwal</h3>
            <p className="board-role">Editorial Advisor</p>
            <p className="board-specialization">Senior Artist (Sitar)</p>
            <ul className="board-meta">
              <li>Ex. Dean and Ex. Head, Department of Music, University of Delhi</li>
            </ul>
          </article>

          <article className="board-item">
            <div className="board-photo-wrap">
              <Image
                src={profSheetalImage}
                alt="Prof. Sheetal More"
                className="board-photo"
              />
            </div>
            <h3>Prof. Sheetal More</h3>
            <p className="board-role">Member Editorial Board</p>
            <p className="board-specialization">Senior Academician</p>
            <ul className="board-meta">
              <li>Head, Department of Music, SNDT Women&apos;s University, Pune</li>
            </ul>
          </article>

          <article className="board-item">
            <div className="board-photo-wrap">
              <Image
                src={drVilasImage}
                alt="Dr. Vilas Jadhav"
                className="board-photo board-photo-contain"
              />
            </div>
            <h3>Dr. Vilas Jadhav</h3>
            <p className="board-role">Member Editorial Board</p>
            <ul className="board-meta">
              <li>
                Deputy Librarian, BMK Knowledge Resource Centre (Pune Branch),
                SNDT Women&apos;s University, Pune
              </li>
              <li>Atulyaswar Publication</li>
              <li>Pune</li>
            </ul>
          </article>

          <article className="board-item">
            <div className="board-photo-wrap">
              <Image
                src={drSanikaImage}
                alt="Dr. Sanika Goregaonkar"
                className="board-photo"
              />
            </div>
            <h3>Dr. Sanika Goregaonkar</h3>
            <p className="board-role">Editor-in-chief, Managing Director</p>
            <p className="board-specialization">Vocalist – Gwalior Gharana</p>
            <ul className="board-meta">
              <li>Assistant Professor, SNDT Women&apos;s University, Pune</li>
            </ul>
          </article>
        </div>
      </>
    );
  }

  if (slug === "current-issue") {
    const currentIssue = await getCurrentIssue();
    const approvedEntries = currentIssue
      ? await listApprovedIssueEntriesForIssue(currentIssue.id)
      : [];
    const fallbackVolumeIssue = getVolumeIssueDetails(new Date());
    const issueFromData = Number(currentIssue?.issueNo);
    const issueNumber: 1 | 2 = issueFromData === 2 ? 2 : 1;
    const yearFromData = Number(currentIssue?.year);
    const issueYear = Number.isFinite(yearFromData) ? yearFromData : fallbackVolumeIssue.year;
    const volumeIssue = getVolumeIssueByYearAndIssue(issueYear, issueNumber);

    return (
      <>
        <h2 className="menu-page-title">Current Issue</h2>
        {currentIssue ? (
          <>
            <p className="issue-title-row">
              <strong>Atulyaswar</strong>
              <span aria-hidden="true"> | </span>
              <span>A peer reviewed, Indian Music Journal</span>
            </p>
            <p>
              <strong>{volumeIssue.headerLabel}</strong>
            </p>
            <p>
              <strong>Publication Window:</strong> {volumeIssue.periodLabel}
            </p>
            <p>
              <strong>Volume No.</strong> {volumeIssue.volumeNumber} | <strong>Issue No.</strong>{" "}
              {volumeIssue.issueNumber}
            </p>
            <p>
              <strong>Title:</strong> {currentIssue.title}
            </p>
            <div className="issue-table-wrap">
              <table className="issue-table">
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Page No.</th>
                    <th>Read</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedEntries.length === 0 ? (
                    <tr>
                      <td>1</td>
                      <td>Issue content will be added soon</td>
                      <td>TBD</td>
                      <td>TBD</td>
                      <td>-</td>
                    </tr>
                  ) : (
                    approvedEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td>{entry.srNo}</td>
                        <td>{entry.title}</td>
                        <td>{entry.author}</td>
                        <td>{entry.pageNo}</td>
                        <td>
                          <a
                            href={entry.readUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-link"
                          >
                            Read
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <IssueEntrySubmissionForm issueId={currentIssue.id} />
          </>
        ) : (
          <p>Current issue is not published yet.</p>
        )}
      </>
    );
  }

  if (slug === "archive") {
    const [archiveIssues, allIssues] = await Promise.all([getArchiveIssues(), listIssues()]);
    const archiveEnabled = allIssues.length >= 2;
    const issuesForView = archiveIssues.length > 0 ? archiveIssues : archiveDummyData;

    return (
      <>
        <ArchiveIssuesClient archiveEnabled={archiveEnabled} issues={issuesForView} />
      </>
    );
  }

  if (slug === "guidelines") {
    return (
      <>
        <h2 className="menu-page-title">Guidelines for Authors</h2>
        <ul className="guideline-list manuscript-guideline-list">
          <li>
            Research paper should be written in following format.
            <ul className="sub-guideline-list manuscript-sub-guideline-list">
              <li>Title of Paper</li>
              <li>Author(s) name with full official designation, institute name, Email, Contact No</li>
              <li>Abstract</li>
              <li>Keywords</li>
              <li>Introduction</li>
              <li>Main body</li>
              <li>Observation/Analysis</li>
              <li>Result</li>
              <li>Reference/Bibliography (in any recognized format)</li>
            </ul>
          </li>
          <li>Submit your manuscript through this website only.</li>
          <li>Word limit is Minimum 2000 to Maximum 5000.</li>
          <li>Fonts allowed: English - Times New Roman in 12 font size, Hindi/Marathi - Unicode Mangal font.</li>
          <li>
            Authors will be notified via email regarding the outcome of the
            review process and the subsequent acceptance or rejection of their
            manuscript.
          </li>
          <li>
            The Editor reserves the right to make necessary linguistic,
            grammatical, and formatting adjustments to manuscripts to ensure
            clarity and adherence to the journal&apos;s guidelines.
          </li>
          <li>
            Authors must adhere to strict ethical standards and avoid the following forms of misconduct:
            <ul className="sub-guideline-list manuscript-sub-guideline-list">
              <li>
                Misrepresentation: Including any false, fraudulent, misleading,
                or fabricated information within the manuscript.
              </li>
              <li>
                Content Liability: Ambiguous content or errors that may lead to
                the misinterpretation of research findings.
              </li>
            </ul>
            In such cases, after consulting with Author, the Journal will
            publish the revised paper.
          </li>
          <li>If plagiarism is identified that violates UGC guidelines, the paper may be rejected.</li>
          <li>
            If submitted manuscript is already published elsewhere, in any form
            (book/chapter in book/book section/research paper etc), the paper
            will be rejected.
          </li>
          <li>
            Author should obtain Plagiarism Report through
            DrillBit/Turnitin/ithenticate softwares and upload it while
            submitting the paper.
          </li>
        </ul>
      </>
    );
  }

  if (slug === "contact-us") {
    return (
      <>
        <h2 className="menu-page-title">Contact Us</h2>
        <ContactUsForm />
      </>
    );
  }

  if (slug === "submit-manuscript") {
    return (
      <>
        <h2 className="menu-page-title">Submit Manuscript</h2>
        <p>
          Submit your manuscript using the form below.
        </p>
        <SubmitManuscriptForm />
      </>
    );
  }

  if (slug === "manuscripts") {
    const approved = await listManuscripts("approved");

    return (
      <>
        <h2 className="menu-page-title">Manuscripts</h2>
        <p>Approved manuscripts are listed below.</p>
        {approved.length === 0 ? (
          <p>No approved manuscripts yet.</p>
        ) : (
          <div className="admin-list">
            {approved.map((item) => (
              <article key={item.id} className="admin-manuscript-card">
                <h3>{item.title}</h3>
                <p><strong>Author(s):</strong> {item.authorNames}</p>
                <p>
                  <strong>Designation(s):</strong>
                  {" "}
                  {item.designations.join(", ") || "N/A"}
                </p>
                <p><strong>Email:</strong> {item.email}</p>
                <p><strong>Submitted:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
              </article>
            ))}
          </div>
        )}
      </>
    );
  }

  if (slug === "open-access-policy") {
    return (
      <>
        <h2 className="menu-page-title">Open Access Policy</h2>
        <p>
          Atulyaswar Journal follows the principle that making research freely
          available to the readers supports a greater global exchange of
          knowledge. Atulyaswar Journal provides free and unlimited reading
          access of the full text of published research papers to its readers
          without paywall barriers.
        </p>
        <p>
          It is 24×7 freely available to read on this website (in online form
          only) without any subscription. It provides readers a link to the full
          texts. Atulyaswar Journal has a citation-friendly, easily discoverable
          publication model.
        </p>

        <h3>Copyright, Author Rights and Licensing Terms</h3>
        <p>
          Reproduction of any content published in Atulyaswar Journal requires
          prior written consent from the Editor.
        </p>
        <p>
          Upon submission of manuscripts via the official website, authors agree
          to grant
          Atulyaswar Journal an irrevocable license to publish the submitted
          material.
        </p>
        <p>
          Authors are solely responsible for obtaining permissions for copyrighted
          material included in submissions. Atulyaswar Journal disclaims all
          liability for copyright infringements resulting from published content.
        </p>

        <h3>Declarations from the Journal</h3>
        <ol className="guideline-list">
          <li>
            Manuscripts submitted to Atulyaswar Journal are evaluated through a
            double-blind review process conducted by subject experts. Double
            Blind review means confidentiality of the reviewer&apos;s identities
            from authors and authors&apos; identities from reviewers.
          </li>
          <li>
            Opinions and views expressed/written in published journal issues are
            strictly those of the respective authors. Atulyaswar Journal and its
            editors disclaim any responsibility for the views or statements
            contained therein.
          </li>
        </ol>
      </>
    );
  }

  notFound();
}
