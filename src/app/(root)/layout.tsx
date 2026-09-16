import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "EAFC Skill Hub",
  // Only a redirect; search engines should index the language pages it points to.
  robots: { index: false, follow: true },
};

// Only wraps the bare "/" page, which forwards visitors to their language.
export default function RootRedirectLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
