"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/icons";
import { RegistrationDialog } from "@/components/registration-dialog";
import { Alert, Button, EmptyState, LoadingState, PageHeading, StatusBadge, SelectField } from "@/components/ui";
import { api, backend, formatDate, formatDateTime } from "@/lib/client-api";
import { useAuth } from "@/lib/auth-context";
import type { Workshop } from "@/lib/types";

export default function WorkshopsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registerFor, setRegisterFor] = useState<Workshop | null>(null);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "scheduled");
  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");
  const [hasSeats, setHasSeats] = useState(searchParams.get("hasSeats") || "");
  const queryString = searchParams.toString();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(queryString);
      const queryStatus = params.get("status");
      setSearch(params.get("search") || "");
      setStatus(!queryStatus || queryStatus === "scheduled" ? "scheduled" : queryStatus === "all" ? "" : queryStatus);
      setFrom(params.get("from") || "");
      setTo(params.get("to") || "");
      setHasSeats(params.get("hasSeats") || "");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [queryString]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const query = new URLSearchParams();
    if (search.trim()) query.set("search", search.trim());
    if (status) query.set("status", status);
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    if (hasSeats) query.set("hasSeats", hasSeats);
    const apiQuery = query.toString();
    const urlQuery = new URLSearchParams(query);
    if (!status) urlQuery.set("status", "all");
    router.replace(`${pathname}?${urlQuery.toString()}`, { scroll: false });
    try {
      setWorkshops(await api<Workshop[]>(backend("workshops", new URLSearchParams(apiQuery))));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Workshops could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [from, hasSeats, pathname, router, search, status, to]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), search ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [load, search]);

  function onCreated() {
    setRegisterFor(null);
    void load();
  }

  return (
    <div className="animate-in">
      <PageHeading
        eyebrow="The catalogue"
        title="Workshops"
        description="Find the right room, time, and idea for your next session."
        action={user?.role === "manager" ? <Link href="/dashboard/workshops/new" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#18201e] px-4 text-xs font-semibold text-white transition hover:bg-[#2d3834]"><Icon name="plus" className="h-4 w-4" /> Create workshop</Link> : undefined}
      />

      <div className="mb-5 rounded-2xl border border-line bg-white p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(200px,1.5fr)_repeat(4,minmax(135px,1fr))]">
          <label className="relative block">
            <span className="mb-2 block text-xs font-semibold text-[#3c4742]">Search the catalogue</span>
            <Icon name="search" className="absolute left-3 top-[39px] h-4 w-4 text-[#909b94]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Title, code, or instructor" className="h-11 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-[#8eaf70] focus:ring-3 focus:ring-[#8eaf70]/15" />
          </label>
          <SelectField label="Workshop status" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
          </SelectField>
          <SelectField label="Seat availability" value={hasSeats} onChange={(event) => setHasSeats(event.target.value)}>
            <option value="">Any availability</option><option value="true">Has open seats</option><option value="false">Fully booked</option>
          </SelectField>
          <label className="block"><span className="mb-2 block text-xs font-semibold text-[#3c4742]">From</span><input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-[#8eaf70]" /></label>
          <label className="block"><span className="mb-2 block text-xs font-semibold text-[#3c4742]">Through</span><input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-[#8eaf70]" /></label>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs text-muted">{loading ? "Finding workshops..." : `${workshops.length} ${workshops.length === 1 ? "workshop" : "workshops"} found`}</div>
        <button onClick={() => { setSearch(""); setStatus(""); setFrom(""); setTo(""); setHasSeats(""); }} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted hover:text-ink"><Icon name="filter" className="h-4 w-4" /> Clear filters</button>
      </div>

      {error && <div className="mb-4"><Alert onRetry={() => void load()}>{error}</Alert></div>}
      {loading ? <LoadingState label="Finding workshops that fit" /> : workshops.length === 0 ? <EmptyState title="No workshops found" description="Try another search or clear the filters to see the full catalogue." /> : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-white md:block">
            <div className="grid grid-cols-[1.65fr_1fr_1fr_1fr_125px] gap-4 border-b border-line bg-[#fbfcfa] px-5 py-3 text-[9px] font-bold uppercase tracking-[.15em] text-[#929c95]">
              <span>Workshop</span><span>When</span><span>Instructor</span><span>Availability</span><span>Status</span>
            </div>
            <div className="divide-y divide-line">
              {workshops.map((workshop) => (
                <div key={workshop.id} className="grid grid-cols-[1.65fr_1fr_1fr_1fr_125px] items-center gap-4 px-5 py-4 transition hover:bg-[#fbfcfa]">
                  <Link href={`/dashboard/workshops/${workshop.id}`} className="group min-w-0">
                    <div className="truncate text-xs font-semibold group-hover:text-[#587543]">{workshop.title}</div>
                    <div className="mt-1 text-[10px] font-medium text-muted">{workshop.code}<span className="px-1.5">·</span>{workshop.location}</div>
                  </Link>
                  <div><div className="text-[11px] font-medium">{formatDate(workshop.startAt)}</div><div className="mt-1 text-[10px] text-muted">{formatDateTime(workshop.startAt)}</div></div>
                  <div className="truncate text-[11px]">{workshop.instructor}</div>
                  <div className="pr-3">
                    <div className="mb-1.5 flex justify-between text-[10px]"><span className="font-semibold">{workshop.seatsAvailable} open</span><span className="text-muted">{workshop.capacity} total</span></div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#edf0eb]"><div className={`h-full rounded-full ${workshop.seatsAvailable === 0 ? "bg-[#d56f64]" : "bg-[#92b66c]"}`} style={{ width: `${Math.min(100, workshop.activeCount / workshop.capacity * 100)}%` }} /></div>
                  </div>
                  <div className="flex items-center justify-between gap-2"><StatusBadge status={workshop.status} />{user?.role !== "admin" && workshop.status === "scheduled" && workshop.seatsAvailable > 0 && <button aria-label={`Register for ${workshop.title}`} onClick={() => setRegisterFor(workshop)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#eef4e7] text-[#617b4c] hover:bg-[#e1edcf]"><Icon name="plus" className="h-4 w-4" /></button>}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 md:hidden">
            {workshops.map((workshop) => (
              <article key={workshop.id} className="rounded-2xl border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-3"><Link href={`/dashboard/workshops/${workshop.id}`} className="text-sm font-semibold">{workshop.title}</Link><StatusBadge status={workshop.status} /></div>
                <div className="mt-1.5 text-[10px] text-muted">{workshop.code} · {workshop.instructor}</div>
                <div className="mt-3 flex justify-between text-[10px] text-muted"><span>{formatDateTime(workshop.startAt)}</span><span>{workshop.seatsAvailable} of {workshop.capacity} seats open</span></div>
                <div className="mt-3 flex gap-2"><Link href={`/dashboard/workshops/${workshop.id}`} className="flex h-9 flex-1 items-center justify-center rounded-lg border border-line text-[11px] font-semibold">Details</Link>{user?.role !== "admin" && workshop.status === "scheduled" && workshop.seatsAvailable > 0 && <Button onClick={() => setRegisterFor(workshop)} className="min-h-9">Register</Button>}</div>
              </article>
            ))}
          </div>
        </>
      )}
      {registerFor && <RegistrationDialog workshopId={registerFor.id} workshopTitle={registerFor.title} onClose={() => setRegisterFor(null)} onCreated={onCreated} onConflict={() => void load()} />}
    </div>
  );
}
