function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.endsWith("youtube.com")) {
      const fromPath = u.pathname.match(/^\/(?:shorts|embed)\/([\w-]+)/)?.[1];
      return u.searchParams.get("v") ?? fromPath ?? null;
    }
  } catch {}
  return null;
}

/** Renders nothing until a move has a YouTube link. */
export function VideoSlot({ url, title, heading }: { url: string | null; title: string; heading: string }) {
  const id = url ? youtubeId(url) : null;
  if (!id) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-bold">{heading}</h2>
      <div className="aspect-video overflow-hidden rounded-2xl border border-border bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={title}
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    </section>
  );
}
