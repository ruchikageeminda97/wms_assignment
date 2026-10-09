import Link from "next/link";
import { Icon } from "@/components/icons";

export default function ForbiddenPage() {
  return <div className="mx-auto grid min-h-[65vh] max-w-md place-items-center text-center">
    <div><span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#f4f1e9] text-[#917644]"><Icon name="warning" className="h-6 w-6" /></span><div className="mb-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#647c53]">Access limited</div><h1 className="m-0 text-3xl font-semibold tracking-tight">This space isn’t yours to enter.</h1><p className="mb-6 mt-3 text-sm leading-6 text-muted">Your account doesn’t have permission for that part of the workspace. If you think this is a mistake, ask your administrator.</p><Link href="/dashboard" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#18201e] px-4 text-xs font-semibold text-white">Back to your workspace <Icon name="arrow" className="h-4 w-4" /></Link></div>
  </div>;
}
