import SiteFooter from "@/components/SiteFooter";
import TopNavbar from "@/components/TopNavbar";

const faqItems = [
  {
    question: "Who can submit the manuscript/research paper?",
    answer:
      "atulyaswarpublication@gmail.com | +91 9765556976 | All Musicians, Singers, Academicians, Researchers, Students, Scholars",
  },
  {
    question: "How to write and submit the manuscript/research paper?",
    answer:
      "Please follow the Guidelines Menu",
  },
  {
    question: "In which language my paper can be written?",
    answer:
      "English or Hindi or Marathi",
  },
  {
    question: "Which reference style is to be followed to write research papers?",
    answer:
      "Any recognised reference style like Chicago, APA etc.",
  },
  {
    question: "What if my paper is rejected?",
    answer:
      "Please follow guidelines given and do better efforts next time!",
  },
  {
    question: "How much fees will be charged to submit the paper?",
    answer:
      "We will let you know the fees through our official email when your paper will be selected to publish after the peer review.",
  },
  {
    question: "What is the procedure for accepting or rejecting the submission?",
    answer:
      "We follow double – blind method for the peer review. The Board of reviewers will approve or reject the paper.",
  },
  {
    question: "Is this a subscription – based journal?",
    answer:
      "No, this is an open access journal with free and unlimited access to full text to the readers.",
  },
  {
    question: "Can readers get a print copy of the journal?",
    answer:
      "No, Atulyaswar Journal is an e-journal, not available to print. Author may download its published pdf copy from the website.",
  },
];

export default function FaqPage() {
  return (
    <main className="page-shell">
      <TopNavbar activePath="/faq" />
      <div className="main-content">
        <section className="product-card faq-section">
          <h1 className="section-title">Frequently Asked Questions</h1>
          <p className="faq-intro">
            Click any question to expand and view the answer.
          </p>

          <div className="faq-list">
            {faqItems.map((item) => (
              <details key={item.question} className="faq-item">
                <summary className="faq-summary">
                  <span>{item.question}</span>
                  <span className="faq-toggle" aria-hidden="true" />
                </summary>
                <p className="faq-answer">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
