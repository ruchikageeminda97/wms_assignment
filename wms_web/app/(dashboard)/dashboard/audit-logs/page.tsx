"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, EmptyState, Field, LoadingState, PageHeading, SelectField } from "@/components/ui";
import { Icon } from "@/components/icons";
import { api, backend, formatDateTime } from "@/lib/client-api";
import type { AuditLog } from "@/lib/types";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [entityType, setEntityType] = useState("");
  const [userId, setUserId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const query = new URLSearchParams();
    if (entityType) query.set("entityType", entityType);
    if (userId) query.set("userId", userId);
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    try {
      setLogs(await api<AuditLog[]>(backend("audit-logs", query)));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Audit history could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [entityType, from, to, userId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  return <div className="animate-in">
    <PageHeading eyebrow="The paper trail" title="Activity log" description="A clear record of the changes that keep your workspace moving." />
    <section className="mb-5 rounded-2xl border border-line bg-white p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SelectField label="What changed" value={entityType} onChange={(event) => setEntityType(event.target.value)}><option value="">All activity</option><option value="workshop">Workshops</option><option value="user">Users</option><option value="registration">Registrations</option></SelectField>
        <Field label="Acting user ID" type="number" min={1} value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="Any team member" />
        <label className="block"><span className="mb-2 block text-xs font-semibold text-[#3c4742]">From</span><input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-[#8eaf70]" /></label>
        <label className="block"><span className="mb-2 block text-xs font-semibold text-[#3c4742]">Through</span><input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-[#8eaf70]" /></label>
      </div>
    </section>
    {error && <div className="mb-4"><Alert onRetry={() => void load()}>{error}</Alert></div>}
    <section className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line px-5 py-5 sm:px-6"><div><h2 className="m-0 text-sm font-semibold">Recent activity</h2><p className="mb-0 mt-1 text-[11px] text-muted">Showing up to 500 newest records.</p></div><div className="rounded-lg bg-[#f2f5ee] px-2.5 py-1.5 text-[10px] font-semibold text-[#617b4e]">{loading ? "…" : logs.length} entries</div></div>
      {loading ? <LoadingState label="Reading the activity log" /> : logs.length === 0 ? <div className="p-5"><EmptyState title="Nothing in the log yet" description="Updates to your workshops and team will appear here as they happen." /></div> : (
        <div className="divide-y divide-line">
          {logs.map((log) => <article key={log.id} className="flex gap-3 px-5 py-4 sm:gap-4 sm:px-6">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f1f4ed] text-[#657d52]"><Icon name={log.entityType === "user" ? "users" : log.entityType === "registration" ? "check" : "calendar"} className="h-[17px] w-[17px]" /></span>
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-1.5 text-xs"><span className="font-semibold capitalize">{log.action.replaceAll("_", " ")}</span><span className="text-muted">· {log.entityType} #{log.entityId}</span></div><div className="mt-1 text-[10px] text-muted">By user #{log.actorId} · {formatDateTime(log.createdAt)}</div>{log.details && <details className="mt-2"><summary className="w-fit cursor-pointer text-[10px] font-semibold text-[#627a4e]">View details</summary><pre className="mt-2 max-w-full overflow-x-auto rounded-lg bg-[#f6f8f4] p-3 text-[10px] text-[#59655d]">{JSON.stringify(log.details, null, 2)}</pre></details>}</div>
            <span className="hidden shrink-0 self-start rounded-full bg-[#f1f3ef] px-2.5 py-1 text-[9px] font-bold capitalize text-[#667169] sm:inline-flex">{log.entityType}</span>
          </article>)}
        </div>
      )}
    </section>
  </div>;
}
