"use client";

import { useMemo, useState } from "react";

import { CodeRow } from "@/components/game/code-row";
import { ColorPalette } from "@/components/game/color-palette";
import { Peg } from "@/components/game/peg";
import { emptyCode } from "@/lib/game/rules";
import { CODE_LENGTH, MAX_GUESSES, type Color, type PublicRoomState } from "@/lib/game/types";

type GameBoardProps = {
  state: PublicRoomState;
  playerId: string;
  onSetSecret: (code: Color[]) => void;
  onGuess: (code: Color[]) => void;
  onContinue: () => void;
};

export function GameBoard({
  state,
  playerId,
  onSetSecret,
  onGuess,
  onContinue,
}: GameBoardProps) {
  const [draft, setDraft] = useState<Array<Color | null>>(emptyCode());
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [activeSlot, setActiveSlot] = useState(0);

  const isSetter = playerId === state.setterId;
  const isBreaker = playerId === state.breakerId;
  const canCompose =
    (state.phase === "setting" && isSetter) ||
    (state.phase === "guessing" && isBreaker);

  const rows = useMemo(() => {
    const list = Array.from({ length: MAX_GUESSES }, (_, index) => {
      const guess = state.guesses[index];
      if (guess) {
        return {
          code: guess.code as Array<Color | null>,
          feedback: guess.feedback,
          filled: true,
        };
      }
      return {
        code: emptyCode(),
        feedback: null,
        filled: false,
      };
    });
    return list;
  }, [state.guesses]);

  function placeColor(slot: number, color: Color) {
    setDraft((prev) => {
      const next = [...prev];
      next[slot] = color;
      return next;
    });
    setActiveSlot(Math.min(slot + 1, CODE_LENGTH - 1));
  }

  function handleSlotClick(index: number) {
    if (!canCompose) return;
    setActiveSlot(index);
    if (selectedColor) {
      placeColor(index, selectedColor);
    }
  }

  function handlePaletteSelect(color: Color) {
    if (!canCompose) return;
    setSelectedColor(color);
    placeColor(activeSlot, color);
  }

  function clearDraft() {
    setDraft(emptyCode());
    setActiveSlot(0);
  }

  function submit() {
    if (!draft.every((c): c is Color => c !== null)) {
      return;
    }
    if (state.phase === "setting" && isSetter) {
      onSetSecret(draft);
      clearDraft();
      return;
    }
    if (state.phase === "guessing" && isBreaker) {
      onGuess(draft);
      clearDraft();
    }
  }

  const phaseCopy = (() => {
    switch (state.phase) {
      case "setting":
        return isSetter
          ? "Compose a secret code of 4 pegs, then lock it in."
          : "Waiting for your opponent to set the secret code…";
      case "guessing":
        return isBreaker
          ? "Crack the code. Red keys = exact. White keys = wrong place."
          : "Your opponent is guessing. Watch the board.";
      case "reveal":
        return "Round over. Reveal the secret, then continue.";
      case "match_over":
        return "Match complete.";
      default:
        return "Waiting for players…";
    }
  })();

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#4a3a28] bg-[#1a1510]/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#8f7a5e]">
              Round {state.round} / 2
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[#f3e6d0]">
              Decoding Board
            </h2>
          </div>
          <p className="max-w-sm text-right text-sm text-[#cbb89a]">{phaseCopy}</p>
        </div>

        {(state.phase === "setting" ||
          state.phase === "guessing" ||
          state.phase === "reveal" ||
          state.phase === "match_over") && (
          <div className="mb-4 rounded-lg border border-dashed border-[#6b5438] bg-[#120e0a] px-3 py-3">
            <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[#8f7a5e]">
              Secret
            </p>
            <div className="flex items-center justify-center gap-2">
              {(state.secret ?? emptyCode()).map((color, index) => (
                <Peg
                  key={index}
                  color={
                    state.secret
                      ? color
                      : isSetter && state.phase === "setting"
                        ? null
                        : null
                  }
                  muted={!state.secret && !(isSetter && state.phase === "setting")}
                />
              ))}
              {!state.secret && !(isSetter && state.phase === "setting") ? (
                <span className="ml-2 text-xs tracking-wide text-[#8f7a5e]">
                  Hidden
                </span>
              ) : null}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {rows.map((row, index) => (
            <CodeRow
              key={index}
              label={String(index + 1).padStart(2, "0")}
              code={row.code}
              feedback={row.feedback}
              dimmed={!row.filled && index !== state.guesses.length}
            />
          ))}
        </div>
      </div>

      {canCompose ? (
        <div className="space-y-3 rounded-xl border border-[#4a3a28] bg-[#221a14] p-4">
          <p className="text-center text-[11px] uppercase tracking-[0.18em] text-[#8f7a5e]">
            {state.phase === "setting" ? "Set your secret" : "Your guess"}
          </p>
          <CodeRow
            code={draft}
            activeIndex={activeSlot}
            onSelectSlot={handleSlotClick}
          />
          <ColorPalette
            selected={selectedColor}
            onSelect={handlePaletteSelect}
          />
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={clearDraft}
              className="rounded-full border border-[#5a4632] px-4 py-2 text-xs uppercase tracking-[0.16em] text-[#cbb89a] hover:border-[#d4a574]"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!draft.every((c) => c !== null)}
              className="rounded-full bg-[#d4a574] px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#1a120c] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {state.phase === "setting" ? "Lock Secret" : "Submit Guess"}
            </button>
          </div>
        </div>
      ) : null}

      {state.phase === "reveal" ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onContinue}
            className="rounded-full bg-[#d4a574] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#1a120c]"
          >
            {state.round >= 2 ? "See Final Score" : "Continue to Round 2"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
