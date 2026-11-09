import { describe, it, expect } from "vitest";
import { initialState } from "../data/gameConfig";
import { advance, scenarios } from "../engine/simulation";
import { isValidSave } from "./validateSave";
describe("saved game validation", () => {
  it("accepts fresh, midgame, and completed saves", () => {
    expect(isValidSave(initialState())).toBe(true);
    expect(isValidSave(advance(initialState("CEO")))).toBe(true);
    expect(isValidSave(scenarios().b)).toBe(true);
  });
  it("rejects corrupt, impossible and missing values", () => {
    for (const value of [
      null,
      {},
      { ...initialState(), cash: -1 },
      { ...initialState(), quality: 101 },
      { ...initialState(), history: [{}] },
      { ...initialState(), market: "invalid" },
      { ...initialState(), turnoverDays: 0 },
      { ...initialState(), purchases: [null] },
    ])
      expect(isValidSave(value)).toBe(false);
  });
});
