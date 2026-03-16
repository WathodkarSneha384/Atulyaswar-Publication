"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Login failed.");
      }

      router.push("/admin/manuscripts");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="product-card admin-login-card">
      <h1 className="section-title">Admin Login</h1>
      <p>Enter admin key to access manuscript review dashboard.</p>
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <label>
          Admin Key
          <input
            className="subscribe-input"
            type="password"
            value={key}
            onChange={(event) => setKey(event.target.value)}
            required
          />
        </label>
        <button className="subscribe-button" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {error && <p className="contact-form-status error">{error}</p>}
    </section>
  );
}
