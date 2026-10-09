import type { ReactNode } from "react";
import { Icon } from "@/components/icons";

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#647c53]">{eyebrow}</div>
        <h1 className="m-0 text-[30px] font-semibold tracking-[-.04em] text-ink sm:text-[38px]">{title}</h1>
        <p className="mb-0 mt-2 max-w-xl text-sm leading-6 text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "quiet" | "danger" }) {
  const variants = {
    primary: "bg-[#18201e] text-white hover:bg-[#2d3834]",
    secondary: "border border-line bg-white text-ink hover:border-[#c7d1c3] hover:bg-[#fbfcfa]",
    quiet: "text-muted hover:bg-[#f0f2ed] hover:text-ink",
    danger: "bg-[#b6433c] text-white hover:bg-[#9f342e]",
  };
  return <button {...props} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-[12px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}>{children}</button>;
}

export function Field({ label, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-semibold text-[#3c4742]">{label}</span>
      <input {...props} className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none transition placeholder:text-[#adb5af] focus:border-[#8eaf70] focus:ring-3 focus:ring-[#8eaf70]/15" />
    </label>
  );
}

export function SelectField({
  label,
  children,
  className = "",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-semibold text-[#3c4742]">{label}</span>
      <select {...props} className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none focus:border-[#8eaf70] focus:ring-3 focus:ring-[#8eaf70]/15">{children}</select>
    </label>
  );
}

export function Alert({ children, tone = "error", onRetry }: { children: ReactNode; tone?: "error" | "success" | "info"; onRetry?: () => void }) {
  const tones = {
    error: "border-[#f0d1cd] bg-[#fff4f1] text-[#a44339]",
    success: "border-[#d9e9ca] bg-[#f4faee] text-[#55743d]",
    info: "border-[#d7e3e8] bg-[#f2f8fa] text-[#496d7a]",
  };
  return <div role="status" className={`flex items-start gap-2 rounded-xl border px-3.5 py-3 text-xs leading-5 ${tones[tone]}`}><Icon name={tone === "error" ? "warning" : "check"} className="mt-0.5 h-4 w-4 shrink-0" /><span className="flex-1">{children}</span>{onRetry && <button onClick={onRetry} className="shrink-0 font-bold underline underline-offset-2">Try again</button>}</div>;
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    scheduled: "bg-[#eaf4e0] text-[#56733f]",
    active: "bg-[#eaf4e0] text-[#56733f]",
    completed: "bg-[#edf0f4] text-[#596474]",
    cancelled: "bg-[#f8e9e7] text-[#a3473e]",
    inactive: "bg-[#f8e9e7] text-[#a3473e]",
    admin: "bg-[#f3edfc] text-[#7655a6]",
    manager: "bg-[#eaf0ff] text-[#4c65a6]",
    staff: "bg-[#edf2ee] text-[#5e7164]",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold capitalize tracking-wide ${styles[status] || "bg-[#edf0ed] text-[#627068]"}`}>{status}</span>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="grid min-h-[240px] place-items-center rounded-2xl border border-dashed border-[#dce2dc] bg-white/60 px-6 text-center">
    <div><span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-[#eff4e8] text-[#617e4b]"><Icon name="spark" className="h-5 w-5" /></span><h3 className="m-0 text-sm font-semibold">{title}</h3><p className="mb-0 mt-1.5 max-w-sm text-xs leading-5 text-muted">{description}</p></div>
  </div>;
}

export function LoadingState({ label = "Loading workspace" }: { label?: string }) {
  return <div className="grid min-h-[220px] place-items-center text-sm text-muted"><span className="flex items-center gap-3"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />{label}</span></div>;
}
