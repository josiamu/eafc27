import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "EAFC Skill Hub",
};

// Only wraps the bare "/" page, which forwards visitors to their language.
export default function RootRedirectLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
