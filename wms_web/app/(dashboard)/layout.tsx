"use client";

import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { AuthProvider } from "@/lib/auth-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-paper text-sm text-muted">Preparing your workspace...</main>}><AuthProvider><DashboardShell>{children}</DashboardShell></AuthProvider></Suspense>;
}
