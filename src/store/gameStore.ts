import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { initialState } from "../data/gameConfig";
import { advance, purchase, lockedReason } from "../engine/simulation";
import type { GameState, MarketId, UpgradeId } from "../types/game";
import { chooseChapter } from "../engine/chapters";
import { isValidSave } from "./validateSave";
interface Store {
  game: GameState;
  advicePending: boolean;
  closeAdvice: () => void;
  start: (player: string, company: string) => void;
  reset: () => void;
  buy: (id: UpgradeId) => void;
  selectMarket: (id: MarketId) => void;
  choose: (id: string) => void;
  run: () => void;
}
export const useGame = create<Store>()(
  persist(
    (set, get) => ({
      game: initialState(),
      advicePending: false,
      closeAdvice: () => set({ advicePending: false }),
      start: (p, c) =>
        set({
          game: initialState(p.trim(), c.trim() || "Mekong Rice Co."),
          advicePending: false,
        }),
      reset: () => set({ game: initialState(), advicePending: false }),
      buy: (id) => set({ game: purchase(get().game, id), advicePending: true }),
      selectMarket: (id) => {
        const g = get().game;
        if (!g.started || g.failed || g.quarter > 4 || g.market === id) return;
        const reason = lockedReason(g, id);
        if (reason) throw new Error(reason);
        set({ game: { ...g, market: id }, advicePending: true });
      },
      choose: (id) =>
        set({ game: chooseChapter(get().game, id), advicePending: true }),
      run: () => {
        const game = get().game;
        if (!game.decisions?.some((d) => d.chapter === game.quarter))
          throw new Error(
            "Hãy chọn chiến lược trong nhiệm vụ chương trước khi vận hành.",
          );
        set({ game: advance(game), advicePending: false });
      },
    }),
    {
      name: "mekong-simulator-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ game: state.game }),
      merge: (saved, current) => {
        const g = (saved as Partial<Store>)?.game;
        return isValidSave(g) ? { ...current, game: g } : current;
      },
    },
  ),
);
