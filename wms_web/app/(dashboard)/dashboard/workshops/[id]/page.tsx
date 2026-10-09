"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, EmptyState, LoadingState, PageHeading, StatusBadge, SelectField } from "@/components/ui";
import { Icon } from "@/components/icons";
import { RegistrationDialog } from "@/components/registration-dialog";
import { api, backend, formatDate, formatDateTime } from "@/lib/client-api";
import { useAuth } from "@/lib/auth-context";
import type { Registration, Workshop } from "@/lib/types";

export default function WorkshopDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      const query = params.toString();
      const [item, history] = await Promise.all([
        api<Workshop>(backend(`workshops/${encodeURIComponent(id)}`)),
        api<Registration[]>(`${backend(`registrations/workshop/${encodeURIComponent(id)}`)}${query ? `?${query}` : ""}`),
      ]);
      setWorkshop(item);
      setRegistrations(history);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Workshop details could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [id, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function cancelRegistration(registration: Registration) {
    if (!window.confirm(`Cancel ${registration.attendeeName}’s registration? This action will remain in the history.`)) return;
    setBusyId(registration.id);
    setError("");
    try {
      await api<Registration>(backend(`registrations/${registration.id}/cancel`), { method: "PATCH" });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Registration could not be cancelled.");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function cancelWorkshop() {
    if (!workshop || !window.confirm(`Cancel “${workshop.title}”? Its registration history will be kept.`)) return;
    setError("");
    try {
      await api<Workshop>(backend(`workshops/${workshop.id}/cancel`), { method: "PATCH" });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Workshop could not be cancelled.");
    }
  }

  function onCreated() {
    setRegisterOpen(false);
    setStatus("");
    void load();
  }

  if (loading) return <LoadingState label="Opening workshop details" />;
  if (!workshop) return <div className="mx-auto max-w-3xl"><Alert onRetry={() => void load()}>{error || "This workshop could not be found."}</Alert></div>;

  const manager = user?.role === "manager";
  const percentFull = Math.min(100, Math.round(workshop.activeCount / workshop.capacity * 100));

  return (
    <div className="animate-in">
      <Link href="/dashboard/workshops" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink"><Icon name="chevron" className="h-3.5 w-3.5 rotate-180" /> All workshops</Link>
      {error && <div className="mb-4"><Alert onRetry={() => void load()}>{error}</Alert></div>}
      <PageHeading eyebrow={`${workshop.code} · Workshop details`} title={workshop.title} description={`A session led by ${workshop.instructor}.`} action={<div className="flex flex-wrap gap-2">{manager && workshop.status === "scheduled" && <><Link href={`/dashboard/workshops/${workshop.id}/edit`} className="inline-flex h-10 items-center justify-center rounded-xl border border-line bg-white px-4 text-xs font-semibold transition hover:bg-[#fbfcfa]">Edit workshop</Link><Button variant="secondary" onClick={() => void cancelWorkshop()}>Cancel workshop</Button></>}{workshop.status === "scheduled" && workshop.seatsAvailable > 0 && <Button onClick={() => setRegisterOpen(true)}><Icon name="plus" className="h-4 w-4" /> Register attendee</Button>}</div>} />

      <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl bg-[#18201e] p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><div className="text-[10px] font-bold uppercase tracking-[.2em] text-white/45">Seat availability</div><div className="mt-3 flex items-baseline gap-2"><span className="text-[52px] font-semibold leading-none tracking-[-.06em]">{workshop.seatsAvailable}</span><span className="text-sm text-white/55">seats left</span></div><div className="mt-2 text-xs text-white/45">{workshop.activeCount} active registrations of {workshop.capacity} seats</div></div>
            <StatusBadge status={workshop.status} />
          </div>
          <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full transition-all ${percentFull >= 90 ? "bg-[#f1bc70]" : "bg-[#b9ef70]"}`} style={{ width: `${percentFull}%` }} /></div>
          <div className="mt-2 flex justify-between text-[10px] text-white/45"><span>{percentFull}% filled</span><span>{workshop.capacity} capacity</span></div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl border border-line bg-white p-5"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f1f4ed] text-[#657d52]"><Icon name="calendar" className="h-[18px] w-[18px]" /></span><div><div className="text-[10px] font-medium uppercase tracking-[.14em] text-muted">Date & time</div><div className="mt-1 text-xs font-semibold">{formatDate(workshop.startAt)} · {formatDateTime(workshop.startAt)}</div></div></div></div>
          <div className="rounded-2xl border border-line bg-white p-5"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f1f4ed] text-[#657d52]"><Icon name="pin" className="h-[18px] w-[18px]" /></span><div><div className="text-[10px] font-medium uppercase tracking-[.14em] text-muted">Location</div><div className="mt-1 text-xs font-semibold">{workshop.location}</div></div></div></div>
        </div>
      </section>

      <section className="mt-7 overflow-hidden rounded-2xl border border-line bg-white">
        <div className="flex flex-col gap-4 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div><h2 className="m-0 text-sm font-semibold">Registration history</h2><p className="mb-0 mt-1 text-[11px] text-muted">Active seats and past cancellations are kept together.</p></div>
          <div className="flex items-center gap-3"><span className="text-[10px] text-muted">{registrations.length} records</span><SelectField label="History status" value={status} onChange={(event) => setStatus(event.target.value)} className="min-w-[145px]"><option value="">All history</option><option value="active">Active</option><option value="cancelled">Cancelled</option></SelectField></div>
        </div>
        {registrations.length === 0 ? <div className="p-5"><EmptyState title="No attendees just yet" description="When someone registers, their details and seat status will show up here." /></div> : (
          <div className="divide-y divide-line">
            {registrations.map((registration) => (
              <div key={registration.id} className="flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#edf2e7] text-[10px] font-bold text-[#5e754b]">{registration.attendeeName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</div>
                <div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold">{registration.attendeeName}</div><div className="mt-1 truncate text-[10px] text-muted">{registration.attendeeEmail}</div></div>
                <div className="min-w-[115px] text-[10px] text-muted"><div>Registered {formatDateTime(registration.registeredAt)}</div>{registration.cancelledAt && <div className="mt-1">Cancelled {formatDateTime(registration.cancelledAt)}</div>}</div>
                <StatusBadge status={registration.status} />
                {registration.status === "active" && <Button variant="quiet" disabled={busyId === registration.id} onClick={() => void cancelRegistration(registration)} className="min-h-8 px-2.5 text-[10px]">{busyId === registration.id ? "Working..." : "Cancel seat"}</Button>}
              </div>
            ))}
          </div>
        )}
      </section>
      {registerOpen && <RegistrationDialog workshopId={workshop.id} workshopTitle={workshop.title} onClose={() => setRegisterOpen(false)} onCreated={onCreated} onConflict={() => void load()} />}
    </div>
  );
}
