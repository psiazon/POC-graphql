import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loan Application Portal",
  description: "Next.js + TypeScript + GraphQL CRUD (production-ready demo)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
