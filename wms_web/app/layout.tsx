import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gather | Workshop Management",
  description: "A thoughtful workspace for workshop registrations and operations.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
