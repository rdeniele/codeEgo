import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeEgo Academy",
  description: "A free, local-first coding academy built for learning by doing.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
