"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { Alert, EmptyState, LoadingState, PageHeading, StatusBadge } from "@/components/ui";
import { api, backend, formatDate, formatDateTime } from "@/lib/client-api";
import { useAuth } from "@/lib/auth-context";
import type { Workshop } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Workshop[]>(backend("workshops"))
      .then(setWorkshops)
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = workshops
    .filter((workshop) => workshop.status === "scheduled" && new Date(workshop.startAt) >= new Date())
    .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
  const openSeats = workshops.reduce((sum, workshop) => sum + (workshop.status === "scheduled" ? workshop.seatsAvailable : 0), 0);
  const filling = workshops.filter((workshop) => workshop.status === "scheduled" && workshop.seatsAvailable > 0 && workshop.seatsAvailable <= 3);

  return (
    <div className="animate-in">
      <PageHeading eyebrow="Your workshop desk" title={`Good to see you, ${user?.fullName.split(" ")[0] || "there"}.`} description="Here’s what’s happening across your workshops." action={<Link href="/dashboard/workshops" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#18201e] px-4 text-xs font-semibold text-white transition hover:bg-[#2d3834]">Explore workshops <Icon name="arrow" className="h-4 w-4" /></Link>} />
      {error && <div className="mb-5"><Alert onRetry={() => { setLoading(true); void api<Workshop[]>(backend("workshops")).then(setWorkshops).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false)); }}>{error}</Alert></div>}

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-[#18201e] p-5 text-white sm:p-6">
          <div className="flex items-center justify-between text-xs text-white/55"><span>Scheduled workshops</span><span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-[#b9ef70]"><Icon name="calendar" className="h-4 w-4" /></span></div>
          <div className="mt-5 text-[38px] font-semibold tracking-[-.05em]">{loading ? "—" : workshops.filter((item) => item.status === "scheduled").length}</div>
          <div className="mt-1 text-[11px] text-white/45">Across your catalogue</div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between text-xs text-muted"><span>Upcoming sessions</span><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#f2f5ee] text-[#667d52]"><Icon name="clock" className="h-4 w-4" /></span></div>
          <div className="mt-5 text-[38px] font-semibold tracking-[-.05em]">{loading ? "—" : upcoming.length}</div>
          <div className="mt-1 text-[11px] text-muted">Ready to welcome attendees</div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between text-xs text-muted"><span>Seats available</span><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#f2f5ee] text-[#667d52]"><Icon name="users" className="h-4 w-4" /></span></div>
          <div className="mt-5 text-[38px] font-semibold tracking-[-.05em]">{loading ? "—" : openSeats}</div>
          <div className="mt-1 text-[11px] text-muted">Total across scheduled workshops</div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-5 py-5 sm:px-6">
            <div><h2 className="m-0 text-sm font-semibold">Coming up</h2><p className="mb-0 mt-1 text-[11px] text-muted">Your next sessions at a glance</p></div>
            <Link href="/dashboard/workshops" className="text-[11px] font-semibold text-[#617b4e] hover:underline">All workshops <span aria-hidden="true">→</span></Link>
          </div>
          {loading ? <LoadingState label="Finding your next workshops" /> : upcoming.length === 0 ? <div className="p-5"><EmptyState title="A little room on the calendar" description="Scheduled workshops will show up here as soon as they’re ready." /></div> : (
            <div className="divide-y divide-line">
              {upcoming.slice(0, 5).map((workshop) => (
                <Link key={workshop.id} href={`/dashboard/workshops/${workshop.id}`} className="group flex items-center gap-4 px-5 py-4 transition hover:bg-[#fbfcfa] sm:px-6">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#f0f4e9] text-center text-[10px] font-bold uppercase leading-4 text-[#526c3d]">{formatDate(workshop.startAt, { month: "short", day: "numeric" }).split(" ").map((part) => <span key={part}>{part}</span>)}</div>
                  <div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold">{workshop.title}</div><div className="mt-1 truncate text-[10px] text-muted">{workshop.code} · {workshop.instructor} · {formatDateTime(workshop.startAt)}</div></div>
                  <div className="hidden text-right sm:block"><div className="text-xs font-semibold">{workshop.seatsAvailable} seats</div><div className="mt-1 text-[10px] text-muted">of {workshop.capacity}</div></div>
                  <StatusBadge status={workshop.status} /><Icon name="chevron" className="h-4 w-4 shrink-0 text-[#aab2ac] transition group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div><h2 className="m-0 text-sm font-semibold">A little heads-up</h2><p className="mb-0 mt-1 text-[11px] text-muted">Workshops that are nearly full</p></div>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f4f1e9] text-[#917644]"><Icon name="spark" className="h-[18px] w-[18px]" /></span>
          </div>
          {loading ? <LoadingState label="Checking seat availability" /> : filling.length === 0 ? <div className="mt-5 rounded-xl bg-[#f6f8f3] p-4 text-xs leading-5 text-muted">Plenty of room in the schedule. No workshops are close to capacity just yet.</div> : (
            <div className="mt-5 space-y-3">
              {filling.slice(0, 4).map((workshop) => (
                <Link key={workshop.id} href={`/dashboard/workshops/${workshop.id}`} className="block rounded-xl border border-[#ecefe9] p-3.5 transition hover:border-[#cbd8c1]">
                  <div className="flex items-center justify-between gap-2"><span className="truncate text-xs font-semibold">{workshop.title}</span><span className="shrink-0 rounded-full bg-[#fcf1df] px-2 py-1 text-[9px] font-bold text-[#94692f]">{workshop.seatsAvailable} left</span></div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eff1ed]"><div className="h-full rounded-full bg-[#d19a48]" style={{ width: `${Math.min(100, workshop.activeCount / workshop.capacity * 100)}%` }} /></div>
                  <div className="mt-1.5 text-[10px] text-muted">{workshop.activeCount} of {workshop.capacity} seats booked</div>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-6 rounded-xl bg-[#f2f5ee] p-4">
            <div className="flex items-center gap-2 text-xs font-semibold"><Icon name="spark" className="h-4 w-4 text-[#66834f]" /> Keep the good ideas flowing</div>
            <p className="mb-0 mt-2 text-[11px] leading-5 text-muted">A new workshop is only a few details away.</p>
            {user?.role === "manager" && <Link href="/dashboard/workshops/new" className="mt-3 inline-flex text-[11px] font-bold text-[#5b7546] hover:underline">Create a workshop →</Link>}
          </div>
        </div>
      </section>
    </div>
  );
}
