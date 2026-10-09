"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { initials } from "@/lib/client-api";
import { Icon } from "@/components/icons";

const navigation = [
  { label: "Overview", href: "/dashboard", icon: "grid", roles: ["manager", "staff"] },
  { label: "Workshops", href: "/dashboard/workshops", icon: "calendar", roles: ["manager", "staff"] },
  { label: "Team access", href: "/dashboard/users", icon: "users", roles: ["admin"] },
  { label: "Activity log", href: "/dashboard/audit-logs", icon: "chart", roles: ["admin", "manager"] },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading, error, refresh, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  if (error && !loading) {
    return <main className="grid min-h-screen place-items-center bg-paper px-5"><div className="max-w-md rounded-2xl border border-line bg-white p-6 text-center"><span className="mx-auto mb-4 grid h-10 w-10 place-items-center rounded-xl bg-[#fff4f1] text-[#a44339]"><Icon name="warning" className="h-5 w-5" /></span><h1 className="m-0 text-lg font-semibold">Couldn’t reach your workspace</h1><p className="mb-5 mt-2 text-sm leading-6 text-muted">{error}</p><button onClick={() => void refresh()} className="h-10 rounded-xl bg-[#18201e] px-4 text-xs font-semibold text-white">Try again</button></div></main>;
  }

  if (loading || !user) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper">
        <div className="flex items-center gap-3 text-sm font-medium text-muted">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
          Preparing your workspace
        </div>
      </main>
    );
  }

  const links = navigation.filter((item) => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-paper lg:flex">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-[264px] flex-col bg-[#18201e] px-5 py-6 text-white transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Link href="/dashboard" className="mb-12 flex items-center gap-3 px-2" onClick={() => setMobileOpen(false)}>
          <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#b9ef70] text-[#18201e]">
            <Icon name="spark" className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-[18px] font-semibold tracking-tight">gather<span className="text-[#b9ef70]">.</span></span>
            <span className="block text-[10px] font-medium uppercase tracking-[.19em] text-white/45">Workshop desk</span>
          </span>
        </Link>

        <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.2em] text-white/35">Workspace</div>
        <nav className="space-y-1">
          {links.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium transition ${active ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/[.06] hover:text-white"}`}
              >
                <Icon name={item.icon} className={`h-[18px] w-[18px] ${active ? "text-[#b9ef70]" : "text-white/45 group-hover:text-white/75"}`} />
                {item.label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#b9ef70]" />}
              </Link>
            );
          })}
        </nav>


        <div className="mt-5 flex items-center gap-3 border-t border-white/10 px-1 pt-5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#d8f5b2] text-xs font-bold text-[#33442b]">{initials(user.fullName)}</div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold">{user.fullName}</div>
            <div className="mt-0.5 truncate text-[10px] capitalize text-white/40">{user.role}</div>
          </div>
          <button aria-label="Sign out" onClick={() => void signOut()} className="rounded-lg p-2 text-white/45 transition hover:bg-white/10 hover:text-white"><Icon name="logout" className="h-4 w-4" /></button>
        </div>
      </aside>

      {mobileOpen && <button aria-label="Close navigation" className="fixed inset-0 z-20 bg-black/35 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <div className="min-w-0 flex-1 lg:ml-[264px]">
        <header className="sticky top-0 z-10 flex h-[68px] items-center justify-between border-b border-line bg-paper/90 px-5 backdrop-blur-md sm:px-8 lg:px-10">
          <button aria-label="Open navigation" onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-ink lg:hidden"><Icon name="menu" className="h-5 w-5" /></button>
          <div className="hidden items-center gap-2 text-xs text-muted sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Everything in its right place</div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-muted sm:block">Your workspace</span>
            <span className="h-8 w-px bg-line" />
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#e8eddf] text-[10px] font-bold text-[#485b38]">{initials(user.fullName)}</div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
