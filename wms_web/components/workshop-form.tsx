"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Field } from "@/components/ui";
import { api, backend } from "@/lib/client-api";
import type { Workshop } from "@/lib/types";

function localDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function WorkshopForm({ workshop }: { workshop?: Workshop }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const values = new FormData(event.currentTarget);
    const payload = {
      code: String(values.get("code")).trim().toUpperCase(),
      title: String(values.get("title")).trim(),
      instructor: String(values.get("instructor")).trim(),
      startAt: new Date(String(values.get("startAt"))).toISOString(),
      location: String(values.get("location")).trim(),
      capacity: Number(values.get("capacity")),
    };
    try {
      const saved = workshop
        ? await api<Workshop>(backend(`workshops/${workshop.id}`), { method: "PATCH", body: JSON.stringify(payload) })
        : await api<Workshop>(backend("workshops"), { method: "POST", body: JSON.stringify(payload) });
      router.push(`/dashboard/workshops/${saved.id}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Workshop could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-line bg-white p-5 sm:p-7">
      <div className="mb-6 border-b border-line pb-5"><h2 className="m-0 text-sm font-semibold">{workshop ? "Workshop details" : "A few details to get started"}</h2><p className="mb-0 mt-1.5 text-xs text-muted">Fields marked with * are required.</p></div>
      {error && <div className="mb-5"><Alert>{error}</Alert></div>}
      <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
        <Field label="Workshop code *" name="code" placeholder="e.g. POT-101" defaultValue={workshop?.code} required maxLength={32} />
        <Field label="Workshop title *" name="title" placeholder="Introduction to pottery" defaultValue={workshop?.title} required maxLength={160} />
        <Field label="Instructor *" name="instructor" placeholder="Instructor name" defaultValue={workshop?.instructor} required maxLength={120} />
        <Field label="Date and time *" name="startAt" type="datetime-local" defaultValue={localDateTime(workshop?.startAt)} required />
        <Field label="Location *" name="location" placeholder="Studio, room, or address" defaultValue={workshop?.location} required maxLength={180} />
        <Field label="Capacity *" name="capacity" type="number" min={workshop?.activeCount || 1} step={1} defaultValue={workshop?.capacity || 12} required />
      </div>
      {workshop && <p className="mb-0 mt-4 text-[11px] text-muted">Capacity cannot be lower than the {workshop.activeCount} active registrations already on this workshop.</p>}
      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={() => router.back()}>Go back</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : workshop ? "Save changes" : "Create workshop"}</Button>
      </div>
    </form>
  );
}
