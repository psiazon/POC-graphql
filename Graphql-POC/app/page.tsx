"use client";

import React, { useEffect, useMemo, useState } from "react";
import { gqlFetch } from "@/lib/graphqlClient";

type LoanStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

type LoanApplication = {
  id: string;
  fullName: string;
  email: string;
  amount: number;
  termMonths: number;
  purpose: string;
  status: LoanStatus;
  createdAt: string;
  updatedAt: string;
};

const GQL = {
  list: /* GraphQL */ `
    query List($limit: Int!, $offset: Int!) {
      loanApplications(limit: $limit, offset: $offset) {
        id
        fullName
        email
        amount
        termMonths
        purpose
        status
        createdAt
        updatedAt
      }
    }
  `,
  create: /* GraphQL */ `
    mutation Create($input: CreateLoanApplicationInput!) {
      createLoanApplication(input: $input) {
        id
        status
        createdAt
      }
    }
  `,
  submit: /* GraphQL */ `
    mutation Submit($id: ID!) {
      submitLoanApplication(id: $id) {
        id
        status
        updatedAt
      }
    }
  `,
  approve: /* GraphQL */ `
    mutation Approve($id: ID!) {
      approveLoanApplication(id: $id) {
        id
        status
        updatedAt
      }
    }
  `,
  reject: /* GraphQL */ `
    mutation Reject($id: ID!) {
      rejectLoanApplication(id: $id) {
        id
        status
        updatedAt
      }
    }
  `,
  del: /* GraphQL */ `
    mutation Delete($id: ID!) {
      deleteLoanApplication(id: $id)
    }
  `,
};

export default function Page() {
  const [apps, setApps] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    amount: 10000,
    termMonths: 36,
    purpose: "",
  });

  const canCreate = useMemo(() => {
    return (
      form.fullName.trim().length >= 2 &&
      form.email.includes("@") &&
      form.amount > 0 &&
      form.termMonths > 0 &&
      form.purpose.trim().length >= 3
    );
  }, [form]);

  async function refresh() {
    const data = await gqlFetch<{ loanApplications: LoanApplication[] }>(GQL.list, { limit: 50, offset: 0 });
    setApps(data.loanApplications);
  }

  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) return;

    setLoading(true);
    setError(null);
    try {
      await gqlFetch<{ createLoanApplication: { id: string } }>(GQL.create, { input: form });
      setForm({ fullName: "", email: "", amount: 10000, termMonths: 36, purpose: "" });
      await refresh();
    } catch (e: any) {
      setError(e.message ?? "Failed to create.");
    } finally {
      setLoading(false);
    }
  }

  async function act(fn: () => Promise<void>) {
    setLoading(true);
    setError(null);
    try {
      await fn();
      await refresh();
    } catch (e: any) {
      setError(e.message ?? "Action failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 1050, margin: "0 auto", padding: 24 }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Loan Application Portal</h1>
        <p style={{ margin: "6px 0 0", opacity: 0.8 }}>
          Production-grade demo: Next.js + TypeScript + GraphQL Yoga + Prisma + Postgres
        </p>
        <p style={{ margin: "6px 0 0", opacity: 0.8 }}>
          GraphQL endpoint: <code>/api/graphql</code> (GraphiQL available in dev)
        </p>
      </header>

      {error && (
        <div style={{ background: "#fee", border: "1px solid #fbb", padding: 12, borderRadius: 10, marginBottom: 16 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <section style={{ background: "#fff", border: "1px solid #e6e6e6", borderRadius: 14, padding: 16, marginBottom: 18 }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>New Application (creates as DRAFT)</h2>

        <form onSubmit={create} style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label>Full name</label>
            <input
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              placeholder="Jane Doe"
              style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label>Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="jane@example.com"
              style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label>Amount</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
              />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label>Term (months)</label>
              <input
                type="number"
                value={form.termMonths}
                onChange={(e) => setForm((f) => ({ ...f, termMonths: Number(e.target.value) }))}
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label>Purpose</label>
            <textarea
              value={form.purpose}
              onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
              placeholder="Debt consolidation, home improvement, etc."
              rows={3}
              style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
            />
          </div>

          <button
            type="submit"
            disabled={!canCreate || loading}
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid #111",
              background: loading ? "#eee" : "#111",
              color: loading ? "#333" : "#fff",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              width: "fit-content",
            }}
          >
            {loading ? "Working..." : "Create Draft"}
          </button>
        </form>
      </section>

      <section style={{ background: "#fff", border: "1px solid #e6e6e6", borderRadius: 14, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>Applications</h2>
          <button
            onClick={() => act(() => refresh())}
            disabled={loading}
            style={{ padding: "8px 10px", borderRadius: 12, border: "1px solid #bbb", background: "#fff" }}
          >
            Refresh
          </button>
        </div>

        {apps.length === 0 ? (
          <p style={{ opacity: 0.75 }}>No applications yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {apps.map((a) => (
              <div key={a.id} style={{ border: "1px solid #efefef", borderRadius: 14, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 320 }}>
                    <div style={{ fontWeight: 800 }}>{a.fullName}</div>
                    <div style={{ opacity: 0.8 }}>{a.email}</div>
                    <div style={{ marginTop: 6 }}>
                      <strong>${a.amount.toLocaleString()}</strong> • {a.termMonths} months •{" "}
                      <span style={{ fontWeight: 800 }}>{a.status}</span>
                    </div>
                    <div style={{ marginTop: 6, opacity: 0.9 }}>{a.purpose}</div>
                    <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                      Created: {new Date(a.createdAt).toLocaleString()} • Updated: {new Date(a.updatedAt).toLocaleString()}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
                      ID: <code>{a.id}</code>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "start" }}>
                    <button
                      onClick={() => act(() => gqlFetch(GQL.submit, { id: a.id }).then(() => Promise.resolve()))}
                      disabled={loading || a.status !== "DRAFT"}
                      style={{ padding: "8px 10px", borderRadius: 12, border: "1px solid #111", background: "#111", color: "#fff" }}
                    >
                      Submit
                    </button>

                    <button
                      onClick={() => act(() => gqlFetch(GQL.approve, { id: a.id }).then(() => Promise.resolve()))}
                      disabled={loading || a.status !== "SUBMITTED"}
                      style={{ padding: "8px 10px", borderRadius: 12, border: "1px solid #bbb", background: "#fff" }}
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => act(() => gqlFetch(GQL.reject, { id: a.id }).then(() => Promise.resolve()))}
                      disabled={loading || a.status !== "SUBMITTED"}
                      style={{ padding: "8px 10px", borderRadius: 12, border: "1px solid #bbb", background: "#fff" }}
                    >
                      Reject
                    </button>

                    <button
                      onClick={() => act(() => gqlFetch(GQL.del, { id: a.id }).then(() => Promise.resolve()))}
                      disabled={loading}
                      style={{ padding: "8px 10px", borderRadius: 12, border: "1px solid #fbb", background: "#fff" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer style={{ marginTop: 18, opacity: 0.8, fontSize: 13 }}>
        Tip: In dev, open <code>/api/graphql</code> to use GraphiQL.
      </footer>
    </main>
  );
}
