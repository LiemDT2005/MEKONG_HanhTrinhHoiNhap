import { create } from "zustand";
import { persist } from "zustand/middleware";
import { initialState } from "../data/gameConfig";
import { advance, purchase, lockedReason } from "../engine/simulation";
import type { GameState, MarketId, UpgradeId } from "../types/game";
import { isValidSave } from "./validateSave";
interface Store {
  game: GameState;
  start: (player: string, company: string) => void;
  reset: () => void;
  buy: (id: UpgradeId) => void;
  selectMarket: (id: MarketId) => void;
  run: () => void;
}
export const useGame = create<Store>()(
  persist(
    (set, get) => ({
      game: initialState(),
      start: (p, c) =>
        set({ game: initialState(p.trim(), c.trim() || "Mekong Rice Co.") }),
      reset: () => set({ game: initialState() }),
      buy: (id) => set({ game: purchase(get().game, id) }),
      selectMarket: (id) => {
        const g = get().game;
        if (g.quarter > 4) return;
        const reason = lockedReason(g, id);
        if (reason) throw new Error(reason);
        set({ game: { ...g, market: id } });
      },
      run: () => set({ game: advance(get().game) }),
    }),
    {
      name: "mekong-simulator-v1",
      version: 1,
      merge: (saved, current) => {
        const g = (saved as Partial<Store>)?.game;
        return isValidSave(g) ? { ...current, game: g } : current;
      },
    },
  ),
);
