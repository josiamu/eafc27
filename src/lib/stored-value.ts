"use client";

import { useSyncExternalStore } from "react";

/**
 * A value persisted in localStorage that React components can subscribe to.
 * Falls back to in-memory storage when localStorage is blocked (private mode, disabled site data).
 */
export type StoredValue<T> = {
  get: () => T;
  set: (value: T) => void;
  subscribe: (listener: () => void) => () => void;
  fallback: T;
};

export function createStoredValue<T>(
  key: string,
  fallback: T,
  parse: (raw: string) => T | undefined,
  serialize: (value: T) => string = JSON.stringify,
): StoredValue<T> {
  const listeners = new Set<() => void>();
  let memoryRaw: string | null = null;
  let cachedRaw: string | null | undefined;
  let cachedValue = fallback;

  function readRaw(): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return memoryRaw;
    }
  }

  function get(): T {
    const raw = readRaw();
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      let parsed: T | undefined;
      try {
        parsed = raw === null ? undefined : parse(raw);
      } catch {
        parsed = undefined;
      }
      cachedValue = parsed ?? fallback;
    }
    return cachedValue;
  }

  function set(value: T) {
    const raw = serialize(value);
    memoryRaw = raw;
    try {
      localStorage.setItem(key, raw);
    } catch {
      // Storage unavailable: memoryRaw keeps the value for this page view.
    }
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  return { get, set, subscribe, fallback };
}

export function useStoredValue<T>(store: StoredValue<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, () => store.fallback);
}
