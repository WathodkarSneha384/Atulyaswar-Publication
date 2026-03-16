import { notFound } from "next/navigation";
import ContactUsForm from "@/components/ContactUsForm";
import IssueEntrySubmissionForm from "@/components/IssueEntrySubmissionForm";
import SubmitManuscriptForm from "@/components/SubmitManuscriptForm";
import JournalShell from "@/components/JournalShell";
import { getArchiveIssues, getCurrentIssue } from "@/lib/issueStore";
import { listManuscripts } from "@/lib/manuscriptStore";

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
        <h2>About</h2>
        <p>
          It is with great pride that we introduce Atulyaswar – A peer reviewed,
          Indian Music Journal dedicated to the research in Indian Classical
          Music.
        </p>
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
          practitioner and the theorist. By operating as an open-access
          platform, we ensure that knowledge is not confined to the ivory towers
          of academia but is freely available to musicians, students, and
          enthusiasts worldwide. The journal will publish two issues per year.
        </p>
        <p>
          Through peer-reviewed research papers, we aim to document the
          &apos;living&apos; nature of our music. We invite scholars and performers
          alike to submit their findings, challenging old paradigms and
          suggesting new ways to perceive the infinite possibilities within a
          single note.
        </p>
      </>
    );
  }

  if (slug === "editorial-board") {
    return (
      <>
        <h2>Board Members</h2>
        <div className="board-list">
          <article className="board-item">
            <h3>1. Pt. Vidyadhar Vyas</h3>
            <p>Editorial Advisor</p>
            <p>Senior Vocalist – Gwalior Gharana</p>
            <p>Ex. Vice Chancellor - Bhatkhande Music Institute, Lucknow</p>
            <p>Ex. Executive Director – ITC Sangeet Research Academy, Kolkata</p>
          </article>

          <article className="board-item">
            <h3>2. Prof. Suneera Kasliwal</h3>
            <p>Editorial Advisor</p>
            <p>Senior Artist (Sitar)</p>
            <p>Ex. Dean and Ex. Head, Department of Music, University of Delhi</p>
          </article>

          <article className="board-item">
            <h3>3. Prof. Sheetal More</h3>
            <p>Member Editorial Board</p>
            <p>Head, Department of Music, SNDT Women&apos;s University, Pune</p>
            <p>Senior Academician</p>
          </article>

          <article className="board-item">
            <h3>4. Dr. Vilas Jadhav</h3>
            <p>Member Editorial Board</p>
            <p>
              Deputy Librarian, BMK Knowledge Resource Centre (Pune Branch),
              SNDT Women&apos;s University, Pune
            </p>
            <p>Atulyaswar Publication</p>
            <p>Pune</p>
          </article>

          <article className="board-item">
            <h3>5. Dr. Sanika Goregaonkar</h3>
            <p>Editor-in-chief, Managing Director</p>
            <p>Vocalist – Gwalior Gharana</p>
            <p>Assistant Professor, SNDT Women&apos;s University, Pune</p>
          </article>
        </div>
      </>
    );
  }

  if (slug === "current-issue") {
    const currentIssue = await getCurrentIssue();

    return (
      <>
        <h2>Current Issue</h2>
        <p>
          <strong>atulyaswarpublication@gmail.com</strong>
        </p>
        <p>
          <strong>+91 9765556976</strong>
        </p>
        <p>
          I will provide updates and status of the first issue soon. But the
          structure will be as follows.
        </p>
        <ul className="journal-list">
          <li>Index of issue (same as a reference site)</li>
          <li>Sr. No., Title, Author, Page no, Read (Clickable)</li>
          <li>After clicking on Read: Show the Research paper pdf</li>
          <li>Download PDF</li>
          <li>Share link</li>
        </ul>
        {currentIssue ? (
          <>
            <p>
              <strong>
                Latest Issue: {currentIssue.title} ({currentIssue.year})
              </strong>
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
                  {currentIssue.entries.length === 0 ? (
                    <tr>
                      <td>1</td>
                      <td>Issue content will be added soon</td>
                      <td>TBD</td>
                      <td>TBD</td>
                      <td>-</td>
                    </tr>
                  ) : (
                    currentIssue.entries.map((entry) => (
                      <tr key={entry.id}>
                        <td>{entry.srNo}</td>
                        <td>{entry.title}</td>
                        <td>{entry.author}</td>
                        <td>{entry.pageNo}</td>
                        <td>
                          <a href={entry.pdfUrl} target="_blank" rel="noreferrer" className="inline-link">
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
    const archiveIssues = await getArchiveIssues();

    return (
      <>
        <h2>Archive</h2>
        <ul className="journal-list">
          <li>Clickable list: year, volume, issue no</li>
          <li>Index of each issue (same as a reference site)</li>
          <li>Sr.No., Title, Author, Page no, Read (Clickable)</li>
          <li>After clicking on Read: Show the Research paper pdf</li>
          <li>Download PDF</li>
          <li>Share link</li>
        </ul>
        {archiveIssues.length === 0 ? (
          <p>No archived issues yet.</p>
        ) : (
          <div className="archive-issue-list">
            {archiveIssues.map((issue) => (
              <details key={issue.id} className="archive-issue-item">
                <summary className="archive-issue-summary">
                  {issue.year}, Vol. {issue.volume}, Issue {issue.issueNo} - {issue.title}
                </summary>
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
                      {issue.entries.map((entry) => (
                        <tr key={entry.id}>
                          <td>{entry.srNo}</td>
                          <td>{entry.title}</td>
                          <td>{entry.author}</td>
                          <td>{entry.pageNo}</td>
                          <td>
                            <a href={entry.pdfUrl} target="_blank" rel="noreferrer" className="inline-link">
                              Read
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
          </div>
        )}
      </>
    );
  }

  if (slug === "guidelines") {
    return (
      <>
        <h2>Guidelines for Authors</h2>
        <ol className="guideline-list">
          <li>
            Research paper should be written in the following format:
            <ul className="journal-list">
              <li>Title of Paper</li>
              <li>
                Author(s) name with full official designation, institute name,
                Email, Contact No
              </li>
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
          <li>
            Fonts allowed:
            <ul className="journal-list">
              <li>English - Times New Roman in 12 font size</li>
              <li>Hindi/Marathi - Unicode Mangal font</li>
            </ul>
          </li>
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
            Authors must adhere to strict ethical standards and avoid the
            following forms of misconduct:
            <ul className="journal-list">
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
          <li>
            If plagiarism is identified that violates UGC guidelines, the paper
            may be rejected.
          </li>
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
        </ol>
      </>
    );
  }

  if (slug === "contact-us") {
    return (
      <>
        <h2>Contact Us</h2>
        <p className="contact-intro">
          Contact form having: Name, Email, Subject, Message, Send
        </p>
        <ContactUsForm />
      </>
    );
  }

  if (slug === "submit-manuscript") {
    return (
      <>
        <h2>Submit Manuscript</h2>
        <p>
          Form will contain these entries. After submitting, the mail will be
          received on
          {" "}
          <strong>atulyaswarpublication@gmail.com</strong>
        </p>
        <SubmitManuscriptForm />
      </>
    );
  }

  if (slug === "manuscripts") {
    const approved = await listManuscripts("approved");

    return (
      <>
        <h2>Manuscripts</h2>
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
        <h2>Open Access Policy</h2>
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
