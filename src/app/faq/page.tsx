import SiteFooter from "@/components/SiteFooter";
import TopNavbar from "@/components/TopNavbar";

const faqItems = [
  {
    question: "How can I submit my manuscript?",
    answer:
      "Go to the Submit section from the footer or journal menu, fill author details, and upload your manuscript with the required declaration.",
  },
  {
    question: "What is the typical review timeline?",
    answer:
      "Initial editorial screening is usually completed first, followed by peer review. The timeline can vary by manuscript quality and reviewer availability.",
  },
  {
    question: "Does the journal follow an open access policy?",
    answer:
      "Yes. The journal aims to make research content accessible to readers and scholars without access barriers.",
  },
  {
    question: "Which citation style should authors use?",
    answer:
      "Authors should follow the style mentioned in Guidelines and keep references consistent throughout the manuscript.",
  },
  {
    question: "Can I submit work related to notation and pedagogy?",
    answer:
      "Yes. Manuscripts on notation systems, pedagogy, performance practice, and interdisciplinary music studies are welcome.",
  },
  {
    question: "How do I contact the editorial team?",
    answer:
      "Use the Contact Us page for official communication channels and submission-related assistance.",
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
