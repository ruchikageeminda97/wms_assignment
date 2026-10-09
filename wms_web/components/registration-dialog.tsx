"use client";

import { useState } from "react";
import { Alert, Button, Field } from "@/components/ui";
import { Icon } from "@/components/icons";
import { ApiError, api, backend } from "@/lib/client-api";
import type { Registration } from "@/lib/types";

export function RegistrationDialog({
  workshopId,
  workshopTitle,
  onClose,
  onCreated,
  onConflict,
}: {
  workshopId: number;
  workshopTitle: string;
  onClose: () => void;
  onCreated: (registration: Registration) => void;
  onConflict?: () => void;
}) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const values = new FormData(event.currentTarget);
    try {
      const registration = await api<Registration>(backend("registrations"), {
        method: "POST",
        body: JSON.stringify({
          workshopId,
          attendeeName: String(values.get("attendeeName")).trim(),
          attendeeEmail: String(values.get("attendeeEmail")).trim(),
        }),
      });
      onCreated(registration);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Registration could not be created.");
      if (reason instanceof ApiError && reason.status === 409) onConflict?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#101613]/50 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="registration-title" className="w-full max-w-[460px] rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
        <div className="mb-6 flex items-start justify-between">
          <div><div className="mb-2 text-[10px] font-bold uppercase tracking-[.19em] text-[#657d52]">New attendee</div><h2 id="registration-title" className="m-0 text-xl font-semibold tracking-tight">Save them a seat</h2><p className="mb-0 mt-1.5 max-w-xs text-xs leading-5 text-muted">{workshopTitle}</p></div>
          <button aria-label="Close dialog" onClick={onClose} className="rounded-lg p-2 text-muted hover:bg-[#f3f5f0]"><Icon name="close" className="h-4 w-4" /></button>
        </div>
        {error && <div className="mb-4"><Alert>{error}</Alert></div>}
        <form onSubmit={submit} className="space-y-4">
          <Field label="Attendee name *" name="attendeeName" placeholder="Full name" autoComplete="name" required maxLength={120} />
          <Field label="Email address *" name="attendeeEmail" type="email" placeholder="name@example.com" autoComplete="email" required maxLength={254} />
          <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>Not now</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving seat..." : "Confirm registration"}</Button>
          </div>
        </form>
      </section>
    </div>
  );
}
