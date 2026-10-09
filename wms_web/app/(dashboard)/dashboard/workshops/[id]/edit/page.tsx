"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Icon } from "@/components/icons";
import { Alert, LoadingState, PageHeading } from "@/components/ui";
import { WorkshopForm } from "@/components/workshop-form";
import { api, backend } from "@/lib/client-api";
import type { Workshop } from "@/lib/types";

export default function EditWorkshopPage() {
  const { id } = useParams<{ id: string }>();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Workshop>(backend(`workshops/${encodeURIComponent(id)}`))
      .then(setWorkshop)
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [id]);

  return <div className="animate-in mx-auto max-w-[860px]">
    <Link href={`/dashboard/workshops/${id}`} className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink"><Icon name="chevron" className="h-3.5 w-3.5 rotate-180" /> Back to workshop</Link>
    <PageHeading eyebrow="Workshop management" title="Edit workshop" description="Keep the important details current for your team and attendees." />
    {loading ? <LoadingState label="Loading workshop details" /> : error ? <Alert>{error}</Alert> : workshop ? <WorkshopForm workshop={workshop} /> : null}
  </div>;
}
