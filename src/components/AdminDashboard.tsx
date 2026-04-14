"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiErrorMessage, caughtErrorMessage } from "@/lib/userMessage";

type TabKey = "manuscripts" | "issues" | "entrySubmissions";

type ManuscriptItem = {
  id: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
  authorNames: string;
  designations: string[];
  title: string;
  email: string;
  phone: string;
  address: string;
  paperFileName: string;
  paperFileMimeType?: string;
  plagiarismFileName: string;
  plagiarismFileMimeType?: string;
  rejectedReason?: string;
};

type IssueEntry = {
  id: string;
  srNo: number;
  title: string;
  author: string;
  pageNo: string;
  pdfUrl: string;
};

type IssueItem = {
  id: string;
  year: string;
  volume: string;
  issueNo: string;
  title: string;
  publicationWindow?: string;
  volumeDisplay?: string;
  status: "current" | "archive";
  createdAt: string;
  entries: IssueEntry[];
};

type IssueEntrySubmission = {
  id: string;
  manuscriptId?: string;
  issueId: string;
  issueTitle: string;
  title: string;
  author: string;
  pageNo: string;
  pdfUrl?: string;
  pdfFileName?: string;
  pdfMimeType?: string;
  pdfBase64?: string;
  submitterEmail: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
  publishStatus: "draft" | "published";
  rejectedReason?: string;
};

type RowData = ManuscriptItem | IssueItem | IssueEntrySubmission;
type IconAction = "view" | "edit" | "delete";
type DeleteTarget = {
  id: string;
  tab: TabKey;
  label: string;
};

type ConfirmTarget =
  | { type: "openEdit"; row: RowData }
  | { type: "publishIssue"; issueId: string }
  | { type: "publishSelected" }
  | { type: "saveEdit" };

type ConfirmDialog = {
  title: string;
  message: string;
  target: ConfirmTarget;
};

function isManuscriptRow(data: RowData): data is ManuscriptItem {
  return "paperFileName" in data && "plagiarismFileName" in data;
}

function formatFieldLabel(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function ActionIcon({ action }: { action: IconAction }) {
  if (action === "view") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="action-icon">
        <path
          d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  if (action === "edit") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="action-icon">
        <path
          d="M12 20h9"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="action-icon">
      <polyline
        points="3 6 5 6 21 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M19 6l-1 14H6L5 6m3 0V4h8v2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const tabs: { key: TabKey; label: string }[] = [
  { key: "manuscripts", label: "Manuscripts" },
  { key: "issues", label: "Issues" },
  { key: "entrySubmissions", label: "Issue To Publish" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("manuscripts");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [manuscripts, setManuscripts] = useState<ManuscriptItem[]>([]);
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [entrySubmissions, setEntrySubmissions] = useState<IssueEntrySubmission[]>([]);

  const [viewData, setViewData] = useState<RowData | null>(null);
  const [editData, setEditData] = useState<RowData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog | null>(null);
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([]);
  const pendingEditFormDataRef = useRef<FormData | null>(null);

  const [newIssue, setNewIssue] = useState({
    title: "",
    publicationWindow: "",
    volumeDisplay: "",
  });

  const currentRows = useMemo(() => {
    if (activeTab === "manuscripts") return manuscripts;
    if (activeTab === "issues") return issues;
    return entrySubmissions;
  }, [activeTab, manuscripts, issues, entrySubmissions]);

  const publishedSubmissionMap = useMemo(() => {
    const map = new Map<string, IssueEntrySubmission[]>();
    for (const item of entrySubmissions) {
      if (item.status !== "approved" || item.publishStatus !== "published") continue;
      const existing = map.get(item.issueId) ?? [];
      existing.push(item);
      map.set(item.issueId, existing);
    }
    return map;
  }, [entrySubmissions]);

  const pendingPublishSubmissionMap = useMemo(() => {
    const map = new Map<string, IssueEntrySubmission[]>();
    for (const item of entrySubmissions) {
      if (item.status !== "approved" || item.publishStatus === "published") continue;
      const existing = map.get(item.issueId) ?? [];
      existing.push(item);
      map.set(item.issueId, existing);
    }
    return map;
  }, [entrySubmissions]);

  const approvedEntrySubmissions = useMemo(
    () => entrySubmissions.filter((item) => item.status === "approved"),
    [entrySubmissions],
  );

  const loadCurrentTabData = useCallback(async (tab: TabKey) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (tab === "manuscripts") {
        const response = await fetch("/api/manuscripts?scope=all");
        const data = (await response.json()) as { items?: ManuscriptItem[]; error?: string };
        if (!response.ok) {
          throw new Error(apiErrorMessage(data.error, "Failed to load manuscripts."));
        }
        setManuscripts(data.items ?? []);
      } else if (tab === "issues") {
        const [issuesResponse, submissionsResponse] = await Promise.all([
          fetch("/api/issues?scope=all"),
          fetch("/api/issue-entry-submissions?scope=all"),
        ]);

        const issuesData = (await issuesResponse.json()) as { items?: IssueItem[]; error?: string };
        if (!issuesResponse.ok) {
          throw new Error(apiErrorMessage(issuesData.error, "Failed to load issues."));
        }

        const submissionsData = (await submissionsResponse.json()) as {
          items?: IssueEntrySubmission[];
          error?: string;
        };
        if (!submissionsResponse.ok) {
          throw new Error(
            apiErrorMessage(submissionsData.error, "Failed to load issue submissions."),
          );
        }

        setIssues(issuesData.items ?? []);
        setEntrySubmissions(submissionsData.items ?? []);
      } else {
        const response = await fetch("/api/issue-entry-submissions?scope=all");
        const data = (await response.json()) as { items?: IssueEntrySubmission[]; error?: string };
        if (!response.ok) {
          throw new Error(apiErrorMessage(data.error, "Failed to load issue submissions."));
        }
        setEntrySubmissions(data.items ?? []);
      }
    } catch (loadError) {
      setError(caughtErrorMessage(loadError, "Failed to load data."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCurrentTabData("manuscripts");
  }, [loadCurrentTabData]);

  function openConfirmDialog(dialog: ConfirmDialog) {
    setConfirmDialog(dialog);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function deleteRow(id: string, tab: TabKey) {
    setError("");
    setSuccess("");

    const endpoint =
      tab === "manuscripts"
        ? `/api/manuscripts/${id}`
        : tab === "issues"
          ? `/api/issues/${id}`
          : `/api/issue-entry-submissions/${id}`;

    const response = await fetch(endpoint, { method: "DELETE" });
    const data = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !data.ok) {
      setError(apiErrorMessage(data.error, "Delete failed."));
      return;
    }
    setSuccess("Deleted successfully.");
    await loadCurrentTabData(tab);
  }

  function requestDelete(target: DeleteTarget) {
    setDeleteTarget(target);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const { id, tab } = deleteTarget;
    setDeleteTarget(null);
    await deleteRow(id, tab);
  }

  async function executeSaveEdit(formData: FormData) {
    if (!editData) return;
    setError("");
    setSuccess("");
    const endpoint =
      activeTab === "manuscripts"
        ? `/api/manuscripts/${editData.id}`
        : activeTab === "issues"
          ? `/api/issues/${editData.id}`
          : `/api/issue-entry-submissions/${editData.id}`;

    let response: Response;
    if (activeTab === "entrySubmissions") {
      const pdfFile = formData.get("pdfFile");
      if (!(pdfFile instanceof File) || pdfFile.size === 0) {
        formData.delete("pdfFile");
      }
      response = await fetch(endpoint, {
        method: "PATCH",
        body: formData,
      });
    } else {
      const payload: Record<string, unknown> = {};
      formData.forEach((value, key) => {
        if (key === "designations") {
          payload[key] = String(value)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        } else {
          payload[key] = String(value);
        }
      });

      response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    const data = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !data.ok) {
      setError(apiErrorMessage(data.error, "Update failed."));
      return;
    }

    setEditData(null);
    setSuccess("Updated successfully.");
    await loadCurrentTabData(activeTab);
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editData) return;
    pendingEditFormDataRef.current = new FormData(event.currentTarget);
    openConfirmDialog({
      title: "Confirm Save",
      message: "Do you want to save these edits?",
      target: { type: "saveEdit" },
    });
  }

  async function executePublishIssueEntries(issueId: string) {
    setError("");
    setSuccess("");
    const response = await fetch("/api/issue-entry-submissions/publish", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issueId }),
    });
    const data = (await response.json()) as {
      ok?: boolean;
      error?: string;
      publishedCount?: number;
    };
    if (!response.ok || !data.ok) {
      setError(apiErrorMessage(data.error, "Publish failed."));
      return;
    }
    setSuccess(`Published ${data.publishedCount ?? 0} approved entries.`);
    await loadCurrentTabData("entrySubmissions");
    await loadCurrentTabData("issues");
  }

  function publishIssueEntries(issueId: string) {
    openConfirmDialog({
      title: "Confirm Publish",
      message: "Publish all approved draft entries for this issue?",
      target: { type: "publishIssue", issueId },
    });
  }

  async function executePublishSelectedEntrySubmissions() {
    if (selectedSubmissionIds.length === 0) return;
    setError("");
    setSuccess("");
    const response = await fetch("/api/issue-entry-submissions/publish", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionIds: selectedSubmissionIds }),
    });
    const data = (await response.json()) as {
      ok?: boolean;
      error?: string;
      publishedCount?: number;
    };
    if (!response.ok || !data.ok) {
      setError(apiErrorMessage(data.error, "Publish failed."));
      return;
    }
    setSelectedSubmissionIds([]);
    setSuccess(`Published ${data.publishedCount ?? 0} selected entries.`);
    await loadCurrentTabData("entrySubmissions");
    await loadCurrentTabData("issues");
  }

  function publishSelectedEntrySubmissions() {
    if (selectedSubmissionIds.length === 0) return;
    openConfirmDialog({
      title: "Confirm Publish",
      message: "Publish selected entries now?",
      target: { type: "publishSelected" },
    });
  }

  function requestEdit(row: RowData) {
    openConfirmDialog({
      title: "Confirm Edit",
      message: "Do you want to edit this entry?",
      target: { type: "openEdit", row },
    });
  }

  async function confirmActionDialog() {
    if (!confirmDialog) return;
    const target = confirmDialog.target;
    setConfirmDialog(null);

    if (target.type === "openEdit") {
      setEditData(target.row);
      return;
    }

    if (target.type === "publishIssue") {
      await executePublishIssueEntries(target.issueId);
      return;
    }

    if (target.type === "publishSelected") {
      await executePublishSelectedEntrySubmissions();
      return;
    }

    const pendingFormData = pendingEditFormDataRef.current;
    pendingEditFormDataRef.current = null;
    if (!pendingFormData) return;
    await executeSaveEdit(pendingFormData);
  }

  function toggleSubmissionSelection(id: string) {
    setSelectedSubmissionIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id],
    );
  }

  function toggleSelectAllDraftApproved() {
    const selectableIds = approvedEntrySubmissions
      .filter((item) => item.publishStatus !== "published")
      .map((item) => item.id);
    if (selectableIds.length === 0) return;
    setSelectedSubmissionIds((prev) =>
      prev.length === selectableIds.length ? [] : selectableIds,
    );
  }

  async function approveManuscriptSubmission(id: string) {
    setError("");
    setSuccess("");
    const response = await fetch(`/api/manuscripts/${id}/approve`, {
      method: "PATCH",
    });
    const data = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !data.ok) {
      setError(apiErrorMessage(data.error, "Approve failed."));
      return;
    }
    setSuccess("Manuscript approved.");
    await loadCurrentTabData("manuscripts");
    if (viewData && viewData.id === id) {
      setViewData(null);
    }
  }

  async function rejectManuscriptSubmission(id: string) {
    setError("");
    setSuccess("");
    const response = await fetch(`/api/manuscripts/${id}/reject`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Rejected by admin" }),
    });
    const data = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !data.ok) {
      setError(apiErrorMessage(data.error, "Reject failed."));
      return;
    }
    setSuccess("Manuscript rejected.");
    await loadCurrentTabData("manuscripts");
    if (viewData && viewData.id === id) {
      setViewData(null);
    }
  }

  async function createIssue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const response = await fetch("/api/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newIssue),
    });
    const data = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !data.ok) {
      setError(apiErrorMessage(data.error, "Failed to create issue."));
      return;
    }
    setNewIssue({ title: "", publicationWindow: "", volumeDisplay: "" });
    setSuccess("Issue created. Previous current issue moved to archive.");
    await loadCurrentTabData("issues");
  }

  function renderTable() {
    if (currentRows.length === 0) {
      return <p className="no-data">No Data Available</p>;
    }

    if (activeTab === "manuscripts") {
      return (
        <div className="issue-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Author</th>
                <th>Title</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {manuscripts.map((item) => (
                <tr key={item.id}>
                  <td>{item.authorNames}</td>
                  <td>{item.title}</td>
                  <td>{item.status}</td>
                  <td className="action-cell">
                    <button type="button" className="icon-action-btn" title="View" aria-label="View" onClick={() => setViewData(item)}>
                      <ActionIcon action="view" />
                    </button>
                    <button
                      type="button"
                      className="icon-action-btn"
                      title="Edit"
                      aria-label="Edit"
                      onClick={() => requestEdit(item)}
                    >
                      <ActionIcon action="edit" />
                    </button>
                    <button
                      type="button"
                      className="icon-action-btn danger"
                      title="Delete"
                      aria-label="Delete"
                      onClick={() =>
                        requestDelete({
                          id: item.id,
                          tab: "manuscripts",
                          label: item.title || item.authorNames,
                        })}
                    >
                      <ActionIcon action="delete" />
                    </button>
                    <a href={`/api/manuscripts/${item.id}/paper`} target="_blank" rel="noreferrer">
                      Paper
                    </a>
                    <a href={`/api/manuscripts/${item.id}/plagiarism`} target="_blank" rel="noreferrer">
                      Plagiarism
                    </a>
                    {item.status === "pending" && (
                      <>
                        <button type="button" onClick={() => approveManuscriptSubmission(item.id)}>
                          Approve
                        </button>
                        <button type="button" onClick={() => rejectManuscriptSubmission(item.id)}>
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === "issues") {
      return (
        <div className="issue-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Issue</th>
                <th>Status</th>
                <th>Published</th>
                <th>Ready to Publish</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.status}</td>
                  <td>{publishedSubmissionMap.get(item.id)?.length ?? 0}</td>
                  <td>{pendingPublishSubmissionMap.get(item.id)?.length ?? 0}</td>
                  <td className="action-cell">
                    <button type="button" className="icon-action-btn" title="View" aria-label="View" onClick={() => setViewData(item)}>
                      <ActionIcon action="view" />
                    </button>
                    <button
                      type="button"
                      className="icon-action-btn"
                      title="Edit"
                      aria-label="Edit"
                      onClick={() => requestEdit(item)}
                    >
                      <ActionIcon action="edit" />
                    </button>
                    <button
                      type="button"
                      className="icon-action-btn danger"
                      title="Delete"
                      aria-label="Delete"
                      onClick={() =>
                        requestDelete({
                          id: item.id,
                          tab: "issues",
                          label: item.title,
                        })}
                    >
                      <ActionIcon action="delete" />
                    </button>
                    <button
                      type="button"
                      onClick={() => publishIssueEntries(item.id)}
                      disabled={(pendingPublishSubmissionMap.get(item.id)?.length ?? 0) === 0}
                    >
                      Publish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (approvedEntrySubmissions.length === 0) {
      return <p className="no-data">No approved manuscript entries available.</p>;
    }

    return (
      <div className="issue-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Issue</th>
              <th>Title</th>
              <th>Author</th>
              <th>Status</th>
              <th>Publish</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {approvedEntrySubmissions.map((item) => (
              <tr key={item.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedSubmissionIds.includes(item.id)}
                    disabled={item.publishStatus === "published"}
                    onChange={() => toggleSubmissionSelection(item.id)}
                    aria-label={`Select ${item.title}`}
                  />
                </td>
                <td>{item.issueTitle}</td>
                <td>{item.title}</td>
                <td>{item.author}</td>
                <td>{item.status}</td>
                <td>{item.publishStatus}</td>
                <td className="action-cell">
                  <button type="button" className="icon-action-btn" title="View" aria-label="View" onClick={() => setViewData(item)}>
                    <ActionIcon action="view" />
                  </button>
                  <button
                    type="button"
                    className="icon-action-btn"
                    title="Edit"
                    aria-label="Edit"
                    onClick={() => requestEdit(item)}
                  >
                    <ActionIcon action="edit" />
                  </button>
                  <button
                    type="button"
                    className="icon-action-btn danger"
                    title="Delete"
                    aria-label="Delete"
                    onClick={() =>
                      requestDelete({
                        id: item.id,
                        tab: "entrySubmissions",
                        label: item.title,
                      })}
                  >
                    <ActionIcon action="delete" />
                  </button>
                  <a
                    href={item.pdfUrl ?? `/api/issue-entry-submissions/${item.id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read/Download PDF
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <section className="product-card admin-dashboard">
      <div className="admin-dashboard-head">
        <h1 className="section-title">Admin Panel</h1>
        <div className="admin-toolbar">
          <button
            type="button"
            className="subscribe-button"
            onClick={() => loadCurrentTabData(activeTab)}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
          <button type="button" className="ghost-admin-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {error && <p className="contact-form-status error">{error}</p>}
      {success && <p className="contact-form-status success">{success}</p>}

      <div className="admin-layout">
        <aside className="admin-sidebar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`admin-side-item ${tab.key === activeTab ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.key);
                setViewData(null);
                setEditData(null);
                setConfirmDialog(null);
                setSelectedSubmissionIds([]);
                void loadCurrentTabData(tab.key);
              }}
            >
              {tab.label}
            </button>
          ))}
        </aside>

        <div className="admin-content">
          {activeTab === "issues" && (
            <form className="issue-create-inline" onSubmit={createIssue}>
              <input
                className="subscribe-input"
                placeholder="Title (optional)"
                value={newIssue.title}
                onChange={(e) => setNewIssue((p) => ({ ...p, title: e.target.value }))}
              />
              <input
                className="subscribe-input"
                placeholder="Publication Window (e.g., January-June)"
                value={newIssue.publicationWindow}
                onChange={(e) =>
                  setNewIssue((p) => ({ ...p, publicationWindow: e.target.value }))}
              />
              <input
                className="subscribe-input"
                placeholder="Volume line (e.g., Volume 14, Issue 2 (January 2026))"
                value={newIssue.volumeDisplay}
                onChange={(e) => setNewIssue((p) => ({ ...p, volumeDisplay: e.target.value }))}
              />
              <p className="admin-auto-issue-note">
                Volume/Issue follow a July–June volume year: Issue 1 (Jul–Dec) and Issue 2
                (Jan–Jun) share the same volume; the create date sets which half you are opening.
              </p>
              <button type="submit" className="subscribe-button">Create Issue</button>
            </form>
          )}
          {activeTab === "entrySubmissions" && (
            <div className="admin-toolbar admin-toolbar-right">
              <button
                type="button"
                className="subscribe-button"
                onClick={publishSelectedEntrySubmissions}
                disabled={selectedSubmissionIds.length === 0}
              >
                Publish Selected
              </button>
              <button
                type="button"
                className="ghost-admin-btn"
                onClick={toggleSelectAllDraftApproved}
              >
                {selectedSubmissionIds.length ===
                approvedEntrySubmissions.filter((item) => item.publishStatus !== "published").length
                  ? "Clear Selection"
                  : "Select All Draft"}
              </button>
            </div>
          )}

          {renderTable()}

          {viewData && (
            <div className="admin-drawer">
              <h3>View Entry</h3>
              <div className="issue-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(viewData)
                      .filter(([key]) => !["entries", "pdfBase64", "pdfMimeType"].includes(key))
                      .map(([key, value]) => (
                        <tr key={key}>
                          <td>{key}</td>
                          <td>
                            {Array.isArray(value)
                              ? value.join(", ")
                              : typeof value === "object" && value !== null
                                ? JSON.stringify(value)
                                : String(value ?? "")}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {"entries" in viewData && Array.isArray(viewData.entries) && (
                <div className="issue-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Sr. No.</th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Page No.</th>
                        <th>PDF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(publishedSubmissionMap.get(viewData.id) ?? []).length === 0 ? (
                        <tr>
                          <td colSpan={5}>No published submissions for this issue.</td>
                        </tr>
                      ) : (
                        (publishedSubmissionMap.get(viewData.id) ?? []).map((entry, index) => (
                          <tr key={entry.id}>
                            <td>{index + 1}</td>
                            <td>{entry.title}</td>
                            <td>{entry.author}</td>
                            <td>{entry.pageNo}</td>
                            <td>
                              <a
                                href={entry.pdfUrl ?? `/api/issue-entry-submissions/${entry.id}/pdf`}
                                target="_blank"
                                rel="noreferrer"
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
              )}

              {isManuscriptRow(viewData) && (
                <div className="admin-toolbar">
                  <a
                    href={`/api/manuscripts/${viewData.id}/paper`}
                    target="_blank"
                    rel="noreferrer"
                    className="ghost-admin-btn"
                  >
                    View Paper
                  </a>
                  <a
                    href={`/api/manuscripts/${viewData.id}/plagiarism`}
                    target="_blank"
                    rel="noreferrer"
                    className="ghost-admin-btn"
                  >
                    View Plagiarism Report
                  </a>
                  {viewData.status === "pending" && (
                    <>
                      <button
                        type="button"
                        className="subscribe-button"
                        onClick={() => approveManuscriptSubmission(viewData.id)}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="ghost-admin-btn"
                        onClick={() => rejectManuscriptSubmission(viewData.id)}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              )}

              <button type="button" className="subscribe-button" onClick={() => setViewData(null)}>
                Close
              </button>
            </div>
          )}

          {editData && (
            <div className="admin-edit-backdrop" role="dialog" aria-modal="true">
              <form className="admin-edit-modal" onSubmit={saveEdit}>
                <div className="admin-edit-head">
                  <h3>Edit Entry</h3>
                  <button
                    type="button"
                    className="ghost-admin-btn"
                    onClick={() => setEditData(null)}
                  >
                    Close
                  </button>
                </div>
                <div className="admin-edit-grid">
                  {Object.entries(editData)
                    .filter(
                      ([key]) =>
                        ![
                          "id",
                          "createdAt",
                          "entries",
                          "status",
                          "publishStatus",
                          "manuscriptId",
                          "pdfBase64",
                          "pdfMimeType",
                        ].includes(key),
                    )
                    .map(([key, value]) => (
                      <label key={key} className="admin-edit-field">
                        {formatFieldLabel(key)}
                        <input
                          name={key}
                          defaultValue={Array.isArray(value) ? value.join(", ") : String(value ?? "")}
                          className="subscribe-input"
                        />
                      </label>
                    ))}
                  {activeTab === "entrySubmissions" && (
                    <label className="admin-edit-field admin-edit-field-full">
                      Replace PDF (optional)
                      <input
                        type="file"
                        name="pdfFile"
                        accept=".pdf,application/pdf"
                        className="subscribe-input"
                      />
                    </label>
                  )}
                </div>
                <div className="admin-toolbar">
                  <button type="submit" className="subscribe-button">Save</button>
                  <button type="button" className="ghost-admin-btn" onClick={() => setEditData(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {deleteTarget && (
        <div className="admin-confirm-backdrop" role="dialog" aria-modal="true">
          <div className="admin-confirm-modal">
            <h3>Confirm Delete</h3>
            <p>
              Do you really want to delete
              {" "}
              <strong>{deleteTarget.label}</strong>
              ?
            </p>
            <div className="admin-confirm-actions">
              <button type="button" className="subscribe-button" onClick={confirmDelete}>
                Yes
              </button>
              <button
                type="button"
                className="ghost-admin-btn"
                onClick={() => setDeleteTarget(null)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDialog && (
        <div className="admin-confirm-backdrop" role="dialog" aria-modal="true">
          <div className="admin-confirm-modal">
            <h3>{confirmDialog.title}</h3>
            <p>{confirmDialog.message}</p>
            <div className="admin-confirm-actions">
              <button type="button" className="subscribe-button" onClick={confirmActionDialog}>
                Yes
              </button>
              <button
                type="button"
                className="ghost-admin-btn"
                onClick={() => {
                  setConfirmDialog(null);
                  pendingEditFormDataRef.current = null;
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
