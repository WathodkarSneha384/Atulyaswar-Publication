"use client";

import { useEffect, useMemo, useState } from "react";

type ArchiveEntry = {
  id: string;
  srNo: number;
  title: string;
  author: string;
  pageNo: string;
  pdfUrl: string;
};

type ArchiveIssue = {
  id: string;
  year: string;
  volume: string;
  issueNo: string;
  title: string;
  entries: ArchiveEntry[];
};

type ArchiveIssuesClientProps = {
  archiveEnabled: boolean;
  issues: ArchiveIssue[];
};

const PAGE_SIZE = 10;

export default function ArchiveIssuesClient({ archiveEnabled, issues }: ArchiveIssuesClientProps) {
  const [selectedIssueId, setSelectedIssueId] = useState<string>(issues[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<ArchiveEntry | null>(null);
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    setSelectedIssueId(issues[0]?.id ?? "");
  }, [issues]);

  useEffect(() => {
    setPage(1);
  }, [selectedIssueId, query]);

  const selectedIssue = useMemo(
    () => issues.find((issue) => issue.id === selectedIssueId) ?? issues[0] ?? null,
    [issues, selectedIssueId],
  );

  const filteredEntries = useMemo(() => {
    if (!selectedIssue) return [];
    const term = query.trim().toLowerCase();
    if (!term) return selectedIssue.entries;

    return selectedIssue.entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(term) || entry.author.toLowerCase().includes(term),
    );
  }, [selectedIssue, query]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + PAGE_SIZE);

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopyMessage("Link copied.");
    } catch {
      setCopyMessage("Could not copy link.");
    }
    window.setTimeout(() => setCopyMessage(""), 1800);
  }

  if (!archiveEnabled) {
    return (
      <p className="archive-disabled-message">
        Archives can be accessed after the publication of the second issue of Atulyaswar Journal
      </p>
    );
  }

  if (issues.length === 0) {
    return <p>No archived issues yet.</p>;
  }

  return (
    <section className="archive-ui">
      <h2>Archives</h2>

      <div className="archive-issue-selector" role="tablist" aria-label="Archive issue list">
        {issues.map((issue) => {
          const isActive = issue.id === selectedIssue?.id;
          return (
            <button
              key={issue.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`archive-issue-chip ${isActive ? "active" : ""}`}
              onClick={() => setSelectedIssueId(issue.id)}
            >
              {issue.year} {"->"} Volume {issue.volume} {"->"} Issue {issue.issueNo}
            </button>
          );
        })}
      </div>

      {selectedIssue ? (
        <>
          <div className="archive-top-bar">
            <p className="archive-issue-heading">
              <strong>{selectedIssue.title}</strong> ({selectedIssue.year}) - Volume {selectedIssue.volume},
              Issue {selectedIssue.issueNo}
            </p>

            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title or author"
              className="archive-search-input"
            />
          </div>

          <div className="issue-table-wrap">
            <table className="issue-table archive-index-table">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Page No.</th>
                  <th>Access</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5}>No matching articles found.</td>
                  </tr>
                ) : (
                  paginatedEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.srNo}</td>
                      <td>{entry.title}</td>
                      <td>{entry.author}</td>
                      <td>{entry.pageNo}</td>
                      <td className="archive-access-cell">
                        <button type="button" className="inline-link" onClick={() => setSelectedEntry(entry)}>
                          Read
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredEntries.length > PAGE_SIZE ? (
            <div className="archive-pagination">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {selectedEntry ? (
        <div className="archive-pdf-modal-backdrop" role="dialog" aria-modal="true">
          <div className="archive-pdf-modal">
            <div className="archive-pdf-modal-head">
              <h3>{selectedEntry.title}</h3>
              <button type="button" onClick={() => setSelectedEntry(null)}>
                Close
              </button>
            </div>
            <iframe src={selectedEntry.pdfUrl} className="archive-pdf-frame" title={selectedEntry.title} />
            <div className="archive-pdf-actions">
              <a href={selectedEntry.pdfUrl} target="_blank" rel="noreferrer" className="inline-link">
                View PDF
              </a>
              <a href={selectedEntry.pdfUrl} download className="inline-link">
                Download PDF
              </a>
              <button type="button" className="inline-link" onClick={() => copyLink(selectedEntry.pdfUrl)}>
                Share Link
              </button>
            </div>
            {copyMessage ? <p className="archive-copy-note">{copyMessage}</p> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
