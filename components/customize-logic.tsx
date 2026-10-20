"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import type { CustomOutfitRule } from "@/lib/types";
import {
  getCustomOutfitRules,
  saveCustomOutfitRules,
} from "@/lib/local-storage-utils";

export default function CustomizeLogic() {
  const [rules, setRules] = useState<CustomOutfitRule[]>([]);
  const [feedback, setFeedback] = useState("");
  useEffect(() => {
    setRules(getCustomOutfitRules());
  }, []);
  const update = <K extends keyof CustomOutfitRule>(
    id: string,
    key: K,
    value: CustomOutfitRule[K],
  ) => {
    setFeedback("");
    setRules((current) =>
      current.map((rule) =>
        rule.id === id ? { ...rule, [key]: value } : rule,
      ),
    );
  };
  const save = (event: FormEvent) => {
    event.preventDefault();
    const invalid = rules.find(
      (rule) =>
        !rule.name.trim() ||
        !rule.description.trim() ||
        (rule.minTemp !== undefined && !Number.isFinite(rule.minTemp)) ||
        (rule.maxTemp !== undefined && !Number.isFinite(rule.maxTemp)) ||
        (rule.minTemp !== undefined &&
          rule.maxTemp !== undefined &&
          rule.minTemp >= rule.maxTemp),
    );
    if (invalid) {
      setFeedback(
        "Give each note a name and clothing advice, and keep its minimum temperature below its maximum.",
      );
      return;
    }
    setFeedback(
      saveCustomOutfitRules(rules)
        ? "Your wardrobe notes are saved. Your next forecast will use them. ♡"
        : "We couldn’t save your notes. Check your browser storage and try again.",
    );
  };
  return (
    <form className="rules-editor" onSubmit={save}>
      <h2>Notes to dress by.</h2>
      <p className="rules-intro">
        Little reminders for the weather you know best.
      </p>
      {!rules.length && (
        <div className="rules-empty">
          Nothing here just yet.
          <br />
          Add your first note and make the forecast feel more like you.
        </div>
      )}
      {rules.map((rule, index) => (
        <fieldset key={rule.id} className="rule-fields">
          <legend>NOTE {String(index + 1).padStart(2, "0")}</legend>
          <header>
            <span>
              {rule.emoji || "♡"} {rule.name || "A new wardrobe note"}
            </span>
            <button
              type="button"
              aria-label={`Remove note ${index + 1}`}
              onClick={() => {
                setRules((current) =>
                  current.filter((item) => item.id !== rule.id),
                );
                setFeedback("");
              }}
            >
              <Trash2 size={16} />
            </button>
          </header>
          <div className="rule-grid">
            <label>
              Note name
              <input
                required
                value={rule.name}
                maxLength={80}
                placeholder="My rainy-day favourites"
                onChange={(event) =>
                  update(rule.id, "name", event.target.value)
                }
              />
            </label>
            <label>
              A little emoji
              <input
                value={rule.emoji}
                maxLength={16}
                placeholder="☔"
                onChange={(event) =>
                  update(rule.id, "emoji", event.target.value)
                }
              />
            </label>
            <label>
              Minimum temperature (°C)
              <input
                type="number"
                step="any"
                value={rule.minTemp ?? ""}
                placeholder="No minimum"
                onChange={(event) =>
                  update(
                    rule.id,
                    "minTemp",
                    event.target.value === ""
                      ? undefined
                      : Number(event.target.value),
                  )
                }
              />
            </label>
            <label>
              Maximum temperature (°C)
              <input
                type="number"
                step="any"
                value={rule.maxTemp ?? ""}
                placeholder="No maximum"
                onChange={(event) =>
                  update(
                    rule.id,
                    "maxTemp",
                    event.target.value === ""
                      ? undefined
                      : Number(event.target.value),
                  )
                }
              />
            </label>
            {(
              [
                { key: "isRaining", label: "Rain" },
                { key: "isSnowing", label: "Snow" },
                { key: "isWindy", label: "Wind above 20 km/h" },
              ] as const
            ).map(({ key, label }) => (
              <label key={key}>
                {label}
                <select
                  value={rule[key] === undefined ? "any" : String(rule[key])}
                  onChange={(event) =>
                    update(
                      rule.id,
                      key,
                      event.target.value === "any"
                        ? undefined
                        : event.target.value === "true",
                    )
                  }
                >
                  <option value="any">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </label>
            ))}
            <label className="full-field">
              What would you like to wear?
              <textarea
                required
                value={rule.description}
                maxLength={1000}
                placeholder="My trusty raincoat, waterproof boots, and a colourful umbrella."
                onChange={(event) =>
                  update(rule.id, "description", event.target.value)
                }
              />
            </label>
          </div>
        </fieldset>
      ))}
      <div className="rules-actions">
        <button
          type="button"
          onClick={() => {
            setRules((current) => [
              ...current,
              { id: crypto.randomUUID(), name: "", emoji: "", description: "" },
            ]);
            setFeedback("");
          }}
        >
          <Plus size={16} />
          Add a note
        </button>
        <button type="submit">
          <Save size={15} />
          Save my notes
        </button>
      </div>
      <p role="status" className="rules-feedback">
        {feedback}
      </p>
    </form>
  );
}
