"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import type { Move } from "@/data/schema";
import { fill, pick, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/th";
import { Stars } from "../Stars";
import { InputSequence } from "./InputSequence";

/** Only the fields a list card needs, so the whole catalogue stays cheap to send. */
export type MoveCard = Pick<Move, "slug" | "name" | "summary" | "stars" | "difficulty" | "verified" | "sequence">;

type Props = {
  moves: MoveCard[];
  locale: Locale;
  t: Dictionary["skills"];
  tMove: Dictionary["move"];
};

const STAR_LEVELS = [1, 2, 3, 4, 5];
const DIFFICULTIES = [1, 2, 3];

function toggle(values: number[], value: number): number[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

export function SkillsBrowser({ moves, locale, t, tMove }: Props) {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [stars, setStars] = useState<number[]>([]);
  const [difficulty, setDifficulty] = useState<number[]>([]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return moves.filter((move) => {
      if (stars.length > 0 && !stars.includes(move.stars)) return false;
      if (difficulty.length > 0 && !difficulty.includes(move.difficulty)) return false;
      if (needle === "") return true;
      // Search both languages so an English name still finds the move while reading Thai.
      return [move.name.th, move.name.en, move.summary.th, move.summary.en].some((text) => text.toLowerCase().includes(needle));
    });
  }, [moves, query, stars, difficulty]);

  const groups = useMemo(() => {
    const byStar = new Map<number, MoveCard[]>();
    for (const move of filtered) {
      const group = byStar.get(move.stars);
      if (group) group.push(move);
      else byStar.set(move.stars, [move]);
    }
    return [...byStar.entries()].sort(([a], [b]) => a - b);
  }, [filtered]);

  const hasFilters = query !== "" || stars.length > 0 || difficulty.length > 0;

  return (
    <div className="space-y-8">
      <div className="space-y-4 rounded-2xl border border-border bg-surface p-4">
        <div className="space-y-1.5">
          <label htmlFor={searchId} className="text-sm font-medium">
            {t.filters.search}
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.filters.searchPlaceholder}
            className="w-full rounded-xl border border-control bg-surface-2 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-4">
          <ChipGroup label={t.filters.stars}>
            {STAR_LEVELS.map((level) => (
              <Chip
                key={level}
                pressed={stars.includes(level)}
                label={fill(tMove.stars, { n: level })}
                onClick={() => setStars((current) => toggle(current, level))}
              >
                {level}
                <span aria-hidden className="text-[var(--star)]">
                  ★
                </span>
              </Chip>
            ))}
          </ChipGroup>

          <ChipGroup label={t.filters.difficulty}>
            {DIFFICULTIES.map((level) => (
              <Chip
                key={level}
                pressed={difficulty.includes(level)}
                label={tMove.difficulty[level - 1]}
                onClick={() => setDifficulty((current) => toggle(current, level))}
              >
                {tMove.difficulty[level - 1]}
              </Chip>
            ))}
          </ChipGroup>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite" className="text-sm text-muted">
            {fill(t.filters.results, { n: filtered.length, total: moves.length })}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStars([]);
                setDifficulty([]);
              }}
              className="rounded-full border border-control px-3 py-1 text-sm text-muted hover:border-accent hover:text-fg"
            >
              {t.filters.clear}
            </button>
          )}
        </div>
      </div>

      {groups.length === 0 && <p className="rounded-2xl border border-border bg-surface p-6 text-center text-muted">{t.filters.empty}</p>}

      {groups.map(([level, group]) => (
        <section key={level} className="space-y-3">
          <h2 className="font-display text-xl font-medium">{fill(t.starsGroup, { n: level })}</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {group.map((move) => (
              <li key={move.slug}>
                <Link
                  href={`/${locale}/skills/${move.slug}/`}
                  className="block h-full space-y-3 rounded-2xl border border-border bg-surface p-4 hover:border-accent"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-medium">{pick(move.name, locale)}</h3>
                      <p className="text-sm text-muted">{pick(move.summary, locale)}</p>
                    </div>
                    <Stars count={move.stars} label={fill(tMove.stars, { n: move.stars })} />
                  </div>
                  <InputSequence sequence={move.sequence} locale={locale} t={tMove} compact />
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-surface-2 px-2 py-0.5 text-muted">
                      {tMove.difficultyLabel}: {tMove.difficulty[move.difficulty - 1]}
                    </span>
                    {!move.verified && <span className="rounded-full bg-warn-bg px-2 py-0.5 text-warn-fg">{tMove.unverified}</span>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ChipGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className="space-y-1.5">
      <span className="block text-sm font-medium">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  pressed,
  label,
  onClick,
  children,
}: {
  pressed: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex items-center gap-0.5 rounded-full border px-3 py-1 text-sm transition-colors ${
        pressed ? "border-accent bg-surface-2 font-medium" : "border-control text-muted hover:border-accent hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}
