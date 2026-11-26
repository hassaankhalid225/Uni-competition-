"use client";

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
  ...props
}: ComponentProps<"button"> & { pendingLabel?: string; variant?: ButtonVariant; size?: ButtonSize }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={buttonClass(variant, size, className)} {...props}>
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
