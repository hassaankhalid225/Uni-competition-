"use client";

import { useFormStatus } from "react-dom";
import type { ComponentProps } from "react";

/**
 * A submit button that locks while its form's server action runs (no double submits), and can
 * ask for confirmation first (destructive actions).
 */
export function PendingButton({
  confirmMessage,
  disabled,
  onClick,
  ...props
}: ComponentProps<"button"> & { confirmMessage?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
      onClick={(e) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      {...props}
      className={`${props.className ?? ""} disabled:cursor-not-allowed disabled:opacity-50`}
    />
  );
}
