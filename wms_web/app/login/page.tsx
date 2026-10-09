"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { Alert, Button, Field } from "@/components/ui";
import { ApiError, api } from "@/lib/client-api";
import type { User } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api<User>("/api/auth/session")
      .then((user) => router.replace(user.role === "admin" ? "/dashboard/users" : "/dashboard"))
      .catch((reason) => {
        if (!(reason instanceof ApiError && reason.status === 401)) {
          setError(reason instanceof Error ? reason.message : "The workspace API could not be reached.");
        }
        setChecking(false);
      });
  }, [router]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const values = new FormData(event.currentTarget);
    try {
      const user = await api<User>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: values.get("email"), password: values.get("password") }),
      });
      router.replace(user.role === "admin" ? "/dashboard/users" : "/dashboard");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We couldn’t sign you in.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) return <main className="grid min-h-screen place-items-center text-sm text-muted">Getting your workspace ready...</main>;

  return (
    <main className="grid min-h-screen bg-[#18201e] lg:grid-cols-[1fr_1fr]">
      <section className="relative hidden overflow-hidden px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -left-32 top-32 h-[430px] w-[430px] rounded-full border border-white/[.07]" />
        <div className="absolute -left-16 top-48 h-[300px] w-[300px] rounded-full border border-white/[.07]" />
        <div className="absolute bottom-[-220px] right-[-160px] h-[560px] w-[560px] rounded-full bg-[#b9ef70]/[.06]" />
        <Link href="/login" className="relative z-10 flex w-fit items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#b9ef70] text-[#18201e]"><Icon name="spark" className="h-5 w-5" /></span>
          <span className="text-lg font-semibold tracking-tight">gather<span className="text-[#b9ef70]">.</span></span>
        </Link>
        <div className="relative z-10 max-w-[520px] py-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.15em] text-[#b9ef70]"><span className="h-1.5 w-1.5 rounded-full bg-[#b9ef70]" /> Your workshop desk</div>
          <h1 className="m-0 max-w-[520px] text-[56px] font-semibold leading-[1.02] tracking-[-.055em] xl:text-[68px]">Make space for <span className="text-[#b9ef70]">good things.</span></h1>
          <p className="mb-0 mt-6 max-w-[410px] text-sm leading-7 text-white/55">Your workshops, registrations, and team—all in one thoughtful place. Spend less time coordinating and more time creating.</p>
          <div className="mt-10 flex items-center gap-3 text-xs text-white/45"><div className="flex -space-x-2"><span className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#18201e] bg-[#e7bea2] text-[9px] font-bold text-[#593c2f]">JL</span><span className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#18201e] bg-[#b6cfaa] text-[9px] font-bold text-[#344a31]">MC</span><span className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#18201e] bg-[#d4c5e9] text-[9px] font-bold text-[#53456a]">AR</span></div><span>Made for the people who make things happen</span></div>
        </div>
        <div className="relative z-10 text-[10px] text-white/30">A calmer way to bring people together.</div>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-paper px-5 py-12 sm:px-10">
        <div className="w-full max-w-[390px]">
          <Link href="/login" className="mb-12 inline-flex items-center gap-2 text-base font-semibold tracking-tight lg:hidden"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#18201e] text-[#b9ef70]"><Icon name="spark" className="h-4 w-4" /></span>gather<span className="-ml-2 text-[#65824e]">.</span></Link>
          <div className="mb-8">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#647c53]">Welcome back</div>
            <h2 className="m-0 text-[32px] font-semibold tracking-[-.045em]">Sign in to Gather</h2>
            <p className="mb-0 mt-2 text-sm text-muted">Use your staff account to open your workspace.</p>
          </div>
          {error && <div className="mb-5"><Alert>{error}</Alert></div>}
          <form onSubmit={submit} className="space-y-5">
            <Field label="Email address" name="email" type="email" placeholder="you@yourworkspace.com" autoComplete="username" required />
            <Field label="Password" name="password" type="password" placeholder="Enter your password" autoComplete="current-password" required />
            <Button type="submit" disabled={loading} className="mt-2 w-full">{loading ? "Signing you in..." : "Continue to workspace"} <Icon name="arrow" className="h-4 w-4" /></Button>
          </form>
          <div className="mt-6 rounded-xl border border-line bg-white px-4 py-3.5 text-[11px] leading-5 text-muted">Accounts are created by your administrator. There’s no public sign-up.</div>
          <p className="mb-0 mt-10 text-center text-[10px] text-[#9ca59e]">Your work stays yours. Sign out when you’re done.</p>
        </div>
      </section>
    </main>
  );
}
