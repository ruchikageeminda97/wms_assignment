import Link from "next/link";
import { Icon } from "@/components/icons";
import { PageHeading } from "@/components/ui";
import { WorkshopForm } from "@/components/workshop-form";

export default function NewWorkshopPage() {
  return <div className="animate-in mx-auto max-w-[860px]">
    <Link href="/dashboard/workshops" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink"><Icon name="chevron" className="h-3.5 w-3.5 rotate-180" /> Back to workshops</Link>
    <PageHeading eyebrow="Make something happen" title="New workshop" description="Add the details and make a little space for something good." />
    <WorkshopForm />
  </div>;
}
