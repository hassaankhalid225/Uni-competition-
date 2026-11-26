"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import type { ComponentProps, ReactNode } from "react";
import { buttonClass, cx, type ButtonSize, type ButtonVariant } from "./ui";
import type { ActionState } from "@/lib/action-result";

export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  size = "md",
  className,
  confirmMessage,
  ...props
}: ComponentProps<"button"> & { pendingLabel?: string; variant?: ButtonVariant; size?: ButtonSize; confirmMessage?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={buttonClass(variant, size, className)}
      {...props}
      onClick={(e) => {
        // Destructive actions ask first; cancelling stops the form submit.
        if (confirmMessage && !window.confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

const inputClass =
  "w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-[15px] text-ink placeholder:text-ink-muted/70 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 aria-[invalid=true]:border-danger";

type FieldProps = {
  name: string;
  label: string;
  hint?: ReactNode;
  state?: ActionState;
  className?: string;
};

function FieldShell({ name, label, hint, state, className, children }: FieldProps & { children: ReactNode }) {
  const errors = state?.fieldErrors?.[name];
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <label htmlFor={name} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {errors?.length ? (
        <p id={`${name}-error`} className="text-sm text-danger">
          {errors[0]}
        </p>
      ) : hint ? (
        <p className="text-xs text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextField({ name, label, hint, state, className, inputClassName, ...input }: FieldProps & ComponentProps<"input"> & { inputClassName?: string }) {
  const invalid = Boolean(state?.fieldErrors?.[name]?.length);
  return (
    <FieldShell name={name} label={label} hint={hint} state={state} className={className}>
      <input
        id={name}
        name={name}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${name}-error` : undefined}
        className={cx(inputClass, "h-10", input.type === "file" && "h-auto py-2 file:mr-3 file:rounded-md file:border-0 file:bg-sunken file:px-3 file:py-1 file:text-sm file:text-ink", inputClassName)}
        {...input}
      />
    </FieldShell>
  );
}

export function TextAreaField({ name, label, hint, state, className, ...textarea }: FieldProps & ComponentProps<"textarea">) {
  const invalid = Boolean(state?.fieldErrors?.[name]?.length);
  return (
    <FieldShell name={name} label={label} hint={hint} state={state} className={className}>
      <textarea
        id={name}
        name={name}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${name}-error` : undefined}
        className={cx(inputClass, "min-h-28 resize-y leading-relaxed")}
        {...textarea}
      />
    </FieldShell>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={cx(
        "rounded-lg px-3 py-2 text-sm",
        state.ok ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
      )}
    >
      {state.message}
    </p>
  );
}

export { inputClass };

/** File input with the size limit shown up front and checked in the browser before upload. */
export function FileField({ name, label, state, accept, maxBytes, kinds }: { name: string; label: string; state?: ActionState; accept: string; maxBytes: number; kinds: string }) {
  const [error, setError] = useState<string | null>(null);
  const mb = Math.round(maxBytes / 1024 / 1024);
  const serverError = state?.fieldErrors?.[name]?.[0];
  return (
    <FieldShell name={name} label={label} hint={`Optional · max ${mb} MB · ${kinds}`} state={error ? { fieldErrors: { [name]: [error] } } : state}>
      <input
        id={name}
        name={name}
        type="file"
        accept={accept}
        aria-invalid={Boolean(error || serverError)}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && file.size > maxBytes) {
            setError(`"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB. Please choose a file under ${mb} MB.`);
            e.target.value = ""; // never submit an oversized file
          } else setError(null);
        }}
        className={cx(inputClass, "h-auto py-2 file:mr-3 file:rounded-md file:border-0 file:bg-sunken file:px-3 file:py-1 file:text-sm file:text-ink")}
      />
    </FieldShell>
  );
}
