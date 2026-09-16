"use client";

import type { Locale } from "@/i18n/config";
import { PRESETS, PRESET_IDS, type PresetId } from "@/controller/presets";
import { setPreset, useControllerSettings } from "@/controller/store";

export function PresetQuickSwitch({ locale, label }: { locale: Locale; label: string }) {
  const { presetId } = useControllerSettings();

  return (
    <label className="inline-flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={presetId}
        onChange={(event) => setPreset(event.target.value as PresetId)}
        className="h-9 max-w-[9.5rem] rounded-full border border-control bg-surface px-3 text-sm text-fg"
      >
        {PRESET_IDS.map((id) => (
          <option key={id} value={id}>
            {PRESETS[id].name[locale]}
          </option>
        ))}
      </select>
    </label>
  );
}
