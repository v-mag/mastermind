"use client";

import { useState, type DragEvent } from "react";

import {
  BoardRowShell,
  BOARD_PEG_SLOT_CLASS,
  FEEDBACK_RAIL_WIDTH_PX,
  TAB_SLOT_GAP_PX,
  TAB_SLOT_WIDTH_PX,
} from "@/components/game/board-row-shell";
import { Peg } from "@/components/game/peg";
import {
  clearActiveDrag,
  readDragPayload,
  setDragSlot,
} from "@/lib/game/drag";
import type { Color, Feedback } from "@/lib/game/types";
import { CODE_LENGTH } from "@/lib/game/types";

type SideFeedbackTabsProps = {
  side: "left" | "right";
  variant: "white" | "red";
  count: number;
  visible: boolean;
};

function SideFeedbackTabs({
  side,
  variant,
  count,
  visible,
}: SideFeedbackTabsProps) {
  return (
    <div
      className={[
        "flex shrink-0 items-center py-1",
        side === "left" ? "flex-row-reverse pr-1" : "flex-row pl-1",
      ].join(" ")}
      style={{ width: FEEDBACK_RAIL_WIDTH_PX, gap: TAB_SLOT_GAP_PX }}
      aria-hidden={!visible}
    >
      {Array.from({ length: CODE_LENGTH }, (_, index) => {
        const extended = visible && index < count;
        const delay = index * 90;

        return (
          <div
            key={index}
            className={[
              "flex h-5 items-center",
              side === "left" ? "justify-end" : "justify-start",
            ].join(" ")}
            style={{ width: TAB_SLOT_WIDTH_PX }}
          >
            <span
              className={[
                "feedback-tab h-4 rounded-full border border-black/30",
                variant === "red" ? "feedback-tab-red" : "feedback-tab-white",
                side === "left" ? "feedback-tab-left" : "feedback-tab-right",
                extended ? "feedback-tab-extended" : "feedback-tab-collapsed",
              ].join(" ")}
              style={{ transitionDelay: `${delay}ms` }}
            />
          </div>
        );
      })}
    </div>
  );
}

type CodeRowProps = {
  code: Array<Color | null>;
  activeIndex?: number | null;
  onSelectSlot?: (index: number) => void;
  onPlaceColor?: (slot: number, color: Color) => void;
  onMoveSlot?: (from: number, to: number) => void;
  enableDrag?: boolean;
  feedback?: Feedback | null;
  label?: string;
  dimmed?: boolean;
};

export function CodeRow({
  code,
  activeIndex = null,
  onSelectSlot,
  onPlaceColor,
  onMoveSlot,
  enableDrag = false,
  feedback = null,
  label,
  dimmed = false,
}: CodeRowProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const hasFeedback = feedback !== null;
  const exactCount = feedback?.black ?? 0;
  const nearCount = feedback?.white ?? 0;
  const canDrop = enableDrag && typeof onPlaceColor === "function";

  function handleDragOver(event: DragEvent, index: number) {
    if (!canDrop) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const allowed = event.dataTransfer.effectAllowed;
    event.dataTransfer.dropEffect =
      allowed === "copy" || allowed === "copyMove" || allowed === "all"
        ? "copy"
        : "move";
    setDragOverIndex(index);
  }

  function handleDrop(event: DragEvent, toIndex: number) {
    if (!canDrop) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setDragOverIndex(null);

    const { color, fromSlot } = readDragPayload(event);
    clearActiveDrag();

    if (!color) {
      return;
    }

    if (fromSlot !== null && onMoveSlot) {
      onMoveSlot(fromSlot, toIndex);
      return;
    }

    onPlaceColor!(toIndex, color);
  }

  return (
    <>
      <BoardRowShell
        label={label}
        dimmed={dimmed}
        leftRail={
          <SideFeedbackTabs
            side="left"
            variant="white"
            count={nearCount}
            visible={hasFeedback}
          />
        }
        rightRail={
          <SideFeedbackTabs
            side="right"
            variant="red"
            count={exactCount}
            visible={hasFeedback}
          />
        }
        onPegTrackDragOver={(event) => {
          if (canDrop) {
            event.preventDefault();
          }
        }}
        pegs={code.map((color, index) => (
          <div
            key={index}
            role="button"
            tabIndex={onSelectSlot ? 0 : -1}
            className={[
              BOARD_PEG_SLOT_CLASS,
              "rounded-full transition-all",
              canDrop ? "cursor-copy" : "",
              dragOverIndex === index
                ? "bg-[#d4a574]/25 ring-2 ring-[#d4a574]/70 ring-offset-1 ring-offset-[#1c1612]"
                : "",
            ].join(" ")}
            draggable={enableDrag && color !== null}
            onDragStart={(event) => {
              if (!enableDrag || !color) {
                return;
              }
              setDragSlot(event, index, color);
              setDraggingIndex(index);
            }}
            onDragEnd={() => {
              setDraggingIndex(null);
            }}
            onClick={
              onSelectSlot
                ? () => onSelectSlot(index)
                : undefined
            }
            onDragOver={(event) => handleDragOver(event, index)}
            onDrop={(event) => handleDrop(event, index)}
          >
            <Peg
              color={color}
              selected={activeIndex === index}
              pointerPassThrough
              dragging={draggingIndex === index}
              ariaLabel={`Slot ${index + 1}${color ? `: ${color}` : ""}`}
            />
          </div>
        ))}
      />
      {hasFeedback ? (
        <span className="sr-only">
          {exactCount} exact, {nearCount} wrong position
        </span>
      ) : null}
    </>
  );
}
