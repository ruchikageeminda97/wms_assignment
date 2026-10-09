"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, Button, EmptyState, Field, LoadingState, PageHeading, SelectField, StatusBadge } from "@/components/ui";
import { api, backend, formatDate } from "@/lib/client-api";
import { Icon } from "@/components/icons";
import type { Role, User } from "@/lib/types";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      setUsers(await api<User[]>(backend("users")));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The team list could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    const form = event.currentTarget;
    const values = new FormData(form);
    try {
      await api<User>(backend("users"), {
        method: "POST",
        body: JSON.stringify({
          fullName: String(values.get("fullName")).trim(),
          email: String(values.get("email")).trim(),
          password: values.get("password"),
          role: values.get("role"),
        }),
      });
      form.reset();
      setNotice("The new account is ready. Share the sign-in details securely with your teammate.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The account could not be created.");
    } finally {
      setSaving(false);
    }
  }

  async function updateRole(user: User, role: Role) {
    setError("");
    setNotice("");
    try {
      const updated = await api<User>(backend(`users/${user.id}/role`), { method: "PATCH", body: JSON.stringify({ role }) });
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice(`Updated ${user.fullName}’s role to ${role}.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The user role could not be changed.");
    }
  }

  async function updateStatus(user: User) {
    const nextActive = !user.isActive;
    if (!nextActive && !window.confirm(`Deactivate ${user.fullName}’s account? They will no longer be able to sign in.`)) return;
    setError("");
    setNotice("");
    try {
      const updated = await api<User>(backend(`users/${user.id}/status`), { method: "PATCH", body: JSON.stringify({ isActive: nextActive }) });
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice(`${user.fullName}’s account is now ${nextActive ? "active" : "inactive"}.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The account status could not be changed.");
    }
  }

  return <div className="animate-in">
    <PageHeading eyebrow="People & permissions" title="Team access" description="Manage the people who make your workshops happen and the spaces they can access." />
    {(error || notice) && <div className="mb-5"><Alert tone={error ? "error" : "success"} onRetry={error ? () => void load() : undefined}>{error || notice}</Alert></div>}

    <section className="mb-7 rounded-2xl border border-line bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3 border-b border-line pb-5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f0f4e9] text-[#657d52]"><Icon name="users" className="h-[18px] w-[18px]" /></span><div><h2 className="m-0 text-sm font-semibold">Create an account</h2><p className="mb-0 mt-1 text-[11px] text-muted">Invite a teammate by setting up their sign-in details.</p></div></div>
      <form onSubmit={createUser} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Field label="Full name *" name="fullName" placeholder="Full name" autoComplete="name" required maxLength={120} />
        <Field label="Email address *" name="email" type="email" placeholder="name@example.com" autoComplete="email" required maxLength={254} />
        <Field label="Temporary password *" name="password" type="password" placeholder="12 characters minimum" autoComplete="new-password" required minLength={12} maxLength={72} />
        <SelectField label="Role *" name="role" defaultValue="staff"><option value="staff">Staff</option><option value="manager">Manager</option><option value="admin">Admin</option></SelectField>
        <div className="flex items-end"><Button type="submit" disabled={saving} className="w-full">{saving ? "Creating..." : "Create account"} <Icon name="plus" className="h-4 w-4" /></Button></div>
      </form>
      <p className="mb-0 mt-3 text-[10px] leading-5 text-muted">Passwords must be 12–72 characters. They are never displayed after the account is created.</p>
    </section>

    <section className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line px-5 py-5 sm:px-6"><div><h2 className="m-0 text-sm font-semibold">All accounts</h2><p className="mb-0 mt-1 text-[11px] text-muted">{loading ? "Loading accounts" : `${users.length} people in your workspace`}</p></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f2f5ee] text-[#667d52]"><Icon name="users" className="h-[18px] w-[18px]" /></span></div>
      {loading ? <LoadingState label="Loading your team" /> : users.length === 0 ? <div className="p-5"><EmptyState title="Your team starts here" description="Create an account above to give your teammate access." /></div> : (
        <>
          <div className="hidden grid-cols-[1.4fr_1.5fr_130px_130px_130px] gap-4 border-b border-line bg-[#fbfcfa] px-5 py-3 text-[9px] font-bold uppercase tracking-[.15em] text-[#929c95] md:grid"><span>Teammate</span><span>Email</span><span>Role</span><span>Account</span><span>Joined</span></div>
          <div className="divide-y divide-line">
            {users.map((user) => <div key={user.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1.4fr_1.5fr_130px_130px_130px] md:items-center md:gap-4">
              <div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#edf2e7] text-[10px] font-bold text-[#5e754b]">{user.fullName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span><div><div className="text-xs font-semibold">{user.fullName}</div><div className="mt-1 text-[10px] text-muted md:hidden">Joined {formatDate(user.createdAt)}</div></div></div>
              <div className="truncate text-[11px] text-muted">{user.email}</div>
              <SelectField aria-label={`Role for ${user.fullName}`} label="Role" className="md:hidden" value={user.role} onChange={(event) => void updateRole(user, event.target.value as Role)}><option value="admin">Admin</option><option value="manager">Manager</option><option value="staff">Staff</option></SelectField>
              <div className="hidden md:block"><SelectField aria-label={`Role for ${user.fullName}`} label="" value={user.role} onChange={(event) => void updateRole(user, event.target.value as Role)}><option value="admin">Admin</option><option value="manager">Manager</option><option value="staff">Staff</option></SelectField></div>
              <div className="flex items-center justify-between md:justify-start md:gap-2"><StatusBadge status={user.isActive ? "active" : "inactive"} /><button onClick={() => void updateStatus(user)} className="text-[10px] font-semibold text-[#617b4e] hover:underline">{user.isActive ? "Deactivate" : "Activate"}</button></div>
              <div className="hidden text-[11px] text-muted md:block">{formatDate(user.createdAt)}</div>
            </div>)}
          </div>
        </>
      )}
    </section>
  </div>;
}
