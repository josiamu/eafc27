import Link from "next/link";

/** Says which game the data comes from; links to the page explaining where it comes from. */
export function DataBadge({ label, href }: { label: string; href?: string }) {
  const className = "inline-flex items-center gap-1.5 rounded-full bg-warn-bg px-2.5 py-1 text-xs font-medium text-warn-fg";
  const content = (
    <>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16.5v.5" />
      </svg>
      {label}
    </>
  );

  return href ? (
    <Link href={href} className={`${className} underline-offset-4 hover:underline`}>
      {content}
    </Link>
  ) : (
    <span className={className}>{content}</span>
  );
}
