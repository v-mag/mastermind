import type { DragEvent, ReactNode } from "react";

import { CODE_LENGTH } from "@/lib/game/types";

export const TAB_SLOT_WIDTH_PX = 34;
export const TAB_SLOT_GAP_PX = 5;
export const FEEDBACK_RAIL_WIDTH_PX =
  CODE_LENGTH * TAB_SLOT_WIDTH_PX + (CODE_LENGTH - 1) * TAB_SLOT_GAP_PX;

export const BOARD_LABEL_CLASS =
  "w-6 shrink-0 font-mono text-xs tracking-wider text-[#a89070]";
export const BOARD_PEG_TRACK_CLASS =
  "flex w-[11.5rem] shrink-0 items-center justify-center gap-2 rounded-lg border border-[#3d3126] bg-[#1c1612]/90 px-2 py-2 shadow-[inset_0_2px_6px_rgba(0,0,0,0.45)]";
export const BOARD_PEG_SLOT_CLASS =
  "flex h-10 w-10 shrink-0 items-center justify-center";

type BoardRowShellProps = {
  label?: string;
  leftRail?: ReactNode;
  pegs: ReactNode;
  rightRail?: ReactNode;
  dimmed?: boolean;
  pegTrackClassName?: string;
  onPegTrackDragOver?: (event: DragEvent<HTMLDivElement>) => void;
};

export function BoardRowShell({
  label,
  leftRail,
  pegs,
  rightRail,
  dimmed = false,
  pegTrackClassName,
  onPegTrackDragOver,
}: BoardRowShellProps) {
  return (
    <div
      className={[
        "flex items-center",
        dimmed ? "opacity-55" : "",
      ].join(" ")}
    >
      <span className={BOARD_LABEL_CLASS}>{label ?? ""}</span>

      <div className="flex min-w-0 flex-1 items-center justify-center">
        <div className="flex items-center gap-3">
          <div
            className="shrink-0 py-1"
            style={{ width: FEEDBACK_RAIL_WIDTH_PX }}
          >
            {leftRail}
          </div>

          <div
            className={[BOARD_PEG_TRACK_CLASS, pegTrackClassName]
              .filter(Boolean)
              .join(" ")}
            onDragOver={onPegTrackDragOver}
          >
            {pegs}
          </div>

          <div
            className="shrink-0 py-1"
            style={{ width: FEEDBACK_RAIL_WIDTH_PX }}
          >
            {rightRail}
          </div>
        </div>
      </div>
    </div>
  );
}
