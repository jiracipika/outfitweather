"use client";

import { useRef, useState } from "react";
import {
  exportOutfitBackup,
  importOutfitBackup,
} from "@/lib/local-storage-utils";

type BackupStatus = { tone: "ok" | "error"; message: string };

export const OUTFIT_DATA_CHANGED_EVENT = "ow:outfit-data-changed";

function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export default function BackupCard() {
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const payload = exportOutfitBackup();
    if (!payload) {
      setStatus({
        tone: "error",
        message: "Couldn’t read your saved looks from this browser.",
      });
      return;
    }
    const url = URL.createObjectURL(
      new Blob([payload], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `outfit-weather-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus({
      tone: "ok",
      message: "Backup downloaded — keep the file somewhere safe.",
    });
  };

  const handleImportFile = async (file: File) => {
    setBusy(true);
    try {
      const result = importOutfitBackup(await file.text());
      if (!result) {
        setStatus({
          tone: "error",
          message: "That file didn’t look like an Outfit Weather backup.",
        });
        return;
      }
      if (!result.saved) {
        setStatus({
          tone: "error",
          message:
            "Ran out of browser storage while saving — free up space and try again.",
        });
        return;
      }
      const parts: string[] = [];
      if (result.importedFavorites > 0) {
        parts.push(
          `${pluralize(result.importedFavorites, "look", "looks")} restored`,
        );
      }
      if (result.importedRules > 0) {
        parts.push(
          `${pluralize(result.importedRules, "custom rule", "custom rules")} restored`,
        );
      }
      if (parts.length === 0) {
        setStatus({ tone: "ok", message: "Nothing new in that file — all saved already." });
      } else {
        const skipped =
          result.duplicateFavorites + result.duplicateRules + result.invalidEntries;
        setStatus({
          tone: "ok",
          message:
            parts.join(" and ") +
            (skipped > 0 ? ` (${pluralize(skipped, "entry", "entries")} skipped).` : "."),
        });
      }
      window.dispatchEvent(new CustomEvent(OUTFIT_DATA_CHANGED_EVENT));
    } catch {
      setStatus({ tone: "error", message: "That file couldn’t be read." });
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  return (
    <div className="ow-backup">
      <span className="ow-eyebrow">BACKUP</span>
      <p className="ow-backup-copy">
        Your archive lives in this browser only. Export it before switching
        devices or clearing site data.
      </p>
      <div className="ow-backup-actions">
        <button type="button" className="ow-return" onClick={handleExport}>
          Download backup ↓
        </button>
        <button
          type="button"
          className="ow-return"
          disabled={busy}
          onClick={() => fileInput.current?.click()}
        >
          Restore from file ↑
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="ow-backup-input"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleImportFile(file);
          }}
        />
      </div>
      {status && (
        <p
          role="status"
          className={status.tone === "ok" ? "ow-backup-status" : "remove-error"}
        >
          {status.message}
        </p>
      )}
    </div>
  );
}
