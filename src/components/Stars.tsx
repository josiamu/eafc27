export function Stars({ count, label }: { count: number; label: string }) {
  return (
    <span role="img" aria-label={label} className="inline-flex text-base leading-none tracking-tight">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} aria-hidden className={i < count ? "text-[var(--star)]" : "text-border"}>
          ★
        </span>
      ))}
    </span>
  );
}
