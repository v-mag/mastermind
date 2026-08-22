import type { DragEvent } from "react";

import { isColor } from "./rules";
import type { Color } from "./types";

export const DRAG_COLOR_TYPE = "application/x-mastermind-color";
export const DRAG_SLOT_TYPE = "application/x-mastermind-slot";

/** In-memory fallback when browsers omit custom MIME data on drop. */
let activeDragPayload: { color: Color; fromSlot: number | null } | null = null;

export function clearActiveDrag() {
  activeDragPayload = null;
}

export function setDragColor(event: DragEvent, color: Color) {
  activeDragPayload = { color, fromSlot: null };
  event.dataTransfer.setData("text/plain", color);
  event.dataTransfer.setData(DRAG_COLOR_TYPE, color);
  event.dataTransfer.effectAllowed = "copyMove";
}

export function setDragSlot(
  event: DragEvent,
  slotIndex: number,
  color: Color,
) {
  activeDragPayload = { color, fromSlot: slotIndex };
  event.dataTransfer.setData("text/plain", color);
  event.dataTransfer.setData(DRAG_COLOR_TYPE, color);
  event.dataTransfer.setData(DRAG_SLOT_TYPE, String(slotIndex));
  event.dataTransfer.effectAllowed = "copyMove";
}

export function readDragPayload(event: DragEvent): {
  color: Color | null;
  fromSlot: number | null;
} {
  const colorRaw =
    event.dataTransfer.getData(DRAG_COLOR_TYPE) ||
    event.dataTransfer.getData("text/plain");

  if (isColor(colorRaw)) {
    const slotRaw = event.dataTransfer.getData(DRAG_SLOT_TYPE);
    const fromSlot =
      slotRaw.length > 0 && !Number.isNaN(Number(slotRaw))
        ? Number(slotRaw)
        : null;
    return { color: colorRaw, fromSlot };
  }

  if (activeDragPayload) {
    return { ...activeDragPayload };
  }

  return { color: null, fromSlot: null };
}
