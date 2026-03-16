"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type TabKey = "manuscripts" | "issues" | "entrySubmissions";

type ManuscriptItem = {
  id: string;
  createdAt: string;
  status: "pending" | "approved";
  authorNames: string;
  designations: string[];
  title: string;
  email: string;
  phone: string;
  address: string;
  paperFileName: string;
  plagiarismFileName: string;
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
  status: "current" | "archive";
  createdAt: string;
  entries: IssueEntry[];
};

type IssueEntrySubmission = {
  id: string;
  issueId: string;
  issueTitle: string;
  title: string;
  author: string;
  pageNo: string;
  pdfUrl: string;
  submitterEmail: string;
  createdAt: string;
  status: "pending" | "approved";
};

type RowData = ManuscriptItem | IssueItem | IssueEntrySubmission;

const tabs: { key: TabKey; label: string }[] = [
  { key: "manuscripts", label: "Manuscripts" },
  { key: "issues", label: "Issues" },
  { key: "entrySubmissions", label: "Issue Entry Submissions" },
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

  const [newIssue, setNewIssue] = useState({
    year: "",
    volume: "",
    issueNo: "",
    title: "",
  });

  const currentRows = useMemo(() => {
    if (activeTab === "manuscripts") return manuscripts;
    if (activeTab === "issues") return issues;
    return entrySubmissions;
  }, [activeTab, manuscripts, issues, entrySubmissions]);

  const loadCurrentTabData = useCallback(async (tab: TabKey) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (tab === "manuscripts") {
        const response = await fetch("/api/manuscripts?scope=all");
        const data = (await response.json()) as { items?: ManuscriptItem[]; error?: string };
        if (!response.ok) throw new Error(data.error ?? "Failed to load manuscripts.");
        setManuscripts(data.items ?? []);
      } else if (tab === "issues") {
        const response = await fetch("/api/issues?scope=all");
        const data = (await response.json()) as { items?: IssueItem[]; error?: string };
        if (!response.ok) throw new Error(data.error ?? "Failed to load issues.");
        setIssues(data.items ?? []);
      } else {
        const response = await fetch("/api/issue-entry-submissions?scope=all");
        const data = (await response.json()) as { items?: IssueEntrySubmission[]; error?: string };
        if (!response.ok) throw new Error(data.error ?? "Failed to load issue submissions.");
        setEntrySubmissions(data.items ?? []);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCurrentTabData("manuscripts");
  }, [loadCurrentTabData]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function deleteRow(id: string) {
    setError("");
    setSuccess("");

    const endpoint =
      activeTab === "manuscripts"
        ? `/api/manuscripts/${id}`
        : activeTab === "issues"
          ? `/api/issues/${id}`
          : `/api/issue-entry-submissions/${id}`;

    const response = await fetch(endpoint, { method: "DELETE" });
    const data = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !data.ok) {
      setError(data.error ?? "Delete failed.");
      return;
    }
    setSuccess("Deleted successfully.");
    await loadCurrentTabData(activeTab);
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editData) return;
    setError("");
    setSuccess("");

    const formData = new FormData(event.currentTarget);
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

    const endpoint =
      activeTab === "manuscripts"
        ? `/api/manuscripts/${editData.id}`
        : activeTab === "issues"
          ? `/api/issues/${editData.id}`
          : `/api/issue-entry-submissions/${editData.id}`;

    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !data.ok) {
      setError(data.error ?? "Update failed.");
      return;
    }

    setEditData(null);
    setSuccess("Updated successfully.");
    await loadCurrentTabData(activeTab);
  }

  async function approveEntrySubmission(id: string) {
    const response = await fetch(`/api/issue-entry-submissions/${id}/approve`, {
      method: "PATCH",
    });
    const data = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !data.ok) {
      setError(data.error ?? "Approve failed.");
      return;
    }
    setSuccess("Approved and published.");
    await loadCurrentTabData("entrySubmissions");
    await loadCurrentTabData("issues");
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
      setError(data.error ?? "Failed to create issue.");
      return;
    }
    setNewIssue({ year: "", volume: "", issueNo: "", title: "" });
    setSuccess("Issue created. Previous current issue moved to archive.");
    await loadCurrentTabData("issues");
  }

  function renderTable() {
    if (currentRows.length === 0) {
      return <p className="no-data">No Data Available</p>;
    }

    if (activeTab === "manuscripts") {
      return (
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
                  <button type="button" onClick={() => setViewData(item)}>View</button>
                  <button type="button" onClick={() => setEditData(item)}>Edit</button>
                  <button type="button" onClick={() => deleteRow(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (activeTab === "issues") {
      return (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Issue</th>
              <th>Status</th>
              <th>Entries</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.status}</td>
                <td>{item.entries.length}</td>
                <td className="action-cell">
                  <button type="button" onClick={() => setViewData(item)}>View</button>
                  <button type="button" onClick={() => setEditData(item)}>Edit</button>
                  <button type="button" onClick={() => deleteRow(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return (
      <table className="admin-table">
        <thead>
          <tr>
            <th>Issue</th>
            <th>Title</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {entrySubmissions.map((item) => (
            <tr key={item.id}>
              <td>{item.issueTitle}</td>
              <td>{item.title}</td>
              <td>{item.status}</td>
              <td className="action-cell">
                <button type="button" onClick={() => setViewData(item)}>View</button>
                <button type="button" onClick={() => setEditData(item)}>Edit</button>
                <button type="button" onClick={() => deleteRow(item.id)}>Delete</button>
                {item.status === "pending" && (
                  <button type="button" onClick={() => approveEntrySubmission(item.id)}>
                    Approve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
                placeholder="Year"
                value={newIssue.year}
                onChange={(e) => setNewIssue((p) => ({ ...p, year: e.target.value }))}
                required
              />
              <input
                className="subscribe-input"
                placeholder="Volume"
                value={newIssue.volume}
                onChange={(e) => setNewIssue((p) => ({ ...p, volume: e.target.value }))}
                required
              />
              <input
                className="subscribe-input"
                placeholder="Issue No"
                value={newIssue.issueNo}
                onChange={(e) => setNewIssue((p) => ({ ...p, issueNo: e.target.value }))}
                required
              />
              <input
                className="subscribe-input"
                placeholder="Title (optional)"
                value={newIssue.title}
                onChange={(e) => setNewIssue((p) => ({ ...p, title: e.target.value }))}
              />
              <button type="submit" className="subscribe-button">Create Issue</button>
            </form>
          )}

          {renderTable()}

          {viewData && (
            <div className="admin-drawer">
              <h3>View Entry</h3>
              <pre>{JSON.stringify(viewData, null, 2)}</pre>
              <button type="button" className="subscribe-button" onClick={() => setViewData(null)}>
                Close
              </button>
            </div>
          )}

          {editData && (
            <form className="admin-drawer" onSubmit={saveEdit}>
              <h3>Edit Entry</h3>
              {Object.entries(editData)
                .filter(([key]) => !["id", "createdAt", "entries", "status"].includes(key))
                .map(([key, value]) => (
                  <label key={key}>
                    {key}
                    <input
                      name={key}
                      defaultValue={Array.isArray(value) ? value.join(", ") : String(value ?? "")}
                      className="subscribe-input"
                    />
                  </label>
                ))}
              <div className="admin-toolbar">
                <button type="submit" className="subscribe-button">Save</button>
                <button type="button" className="ghost-admin-btn" onClick={() => setEditData(null)}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
