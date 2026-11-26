import { CalendarDays, Camera, CodeXml, Palette, type LucideIcon } from "lucide-react";
import type { SubSocietyFocus } from "@/lib/db/schema";

const ICONS: Record<SubSocietyFocus, LucideIcon> = {
  media: Camera,
  graphics: Palette,
  coding: CodeXml,
  events: CalendarDays,
};

/** Short labels for compact lists ("Event Management" reads as "Events"). */
export const SUB_SOCIETY_SHORT_LABEL: Record<SubSocietyFocus, string> = {
  media: "Media",
  graphics: "Graphics",
  coding: "Coding",
  events: "Events",
};

export function SubSocietyIcon({ focus, size = 18, className }: { focus: SubSocietyFocus; size?: number; className?: string }) {
  const Icon = ICONS[focus];
  return <Icon size={size} aria-hidden className={className} />;
}
