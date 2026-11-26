"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { ActionState } from "@/lib/action-result";
import { cx } from "@/components/ui";
import { inputClass } from "@/components/forms";

const LEVELS = [
  { label: "Too short", tone: "bg-danger" },
  { label: "Weak", tone: "bg-danger" },
  { label: "Fair", tone: "bg-warning" },
  { label: "Good", tone: "bg-success" },
  { label: "Strong", tone: "bg-success" },
];

/** 0–4: length plus variety of character types. */
function strength(pw: string) {
  if (pw.length < 8) return 0;
  let score = 1;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

export function PasswordField({
  name = "password",
  label = "Password",
  state,
  autoComplete,
  showStrength = false,
}: {
  name?: string;
  label?: string;
  state?: ActionState;
  autoComplete: string;
  showStrength?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const error = state?.fieldErrors?.[name]?.[0];
  const level = strength(value);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : showStrength ? `${name}-strength` : undefined}
          className={cx(inputClass, "h-12 rounded-xl pr-12")}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-ink-muted hover:text-ink"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error ? (
        <p id={`${name}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : (
        showStrength && (
          <div id={`${name}-strength`} className="flex items-center gap-3" aria-live="polite">
            <div className="flex flex-1 gap-1">
              {[1, 2, 3, 4].map((i) => (
                <span key={i} className={cx("h-1 flex-1 rounded-full transition-colors", value && level >= i ? LEVELS[level].tone : "bg-line")} />
              ))}
            </div>
            <span className="w-16 text-right font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
              {value ? LEVELS[level].label : "8+ chars"}
            </span>
          </div>
        )
      )}
    </div>
  );
}
