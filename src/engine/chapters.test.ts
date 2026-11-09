import { describe, expect, it } from "vitest";
import { chapters } from "../data/chapters";
import { initialState } from "../data/gameConfig";
import { advance, preview, purchase, scenarios } from "./simulation";
import { chapterAchieved, chooseChapter, competitiveness } from "./chapters";
import { isValidSave } from "../store/validateSave";
import type { GameState } from "../types/game";

describe("chapter strategy engine", () => {
  it("makes expensive expansion a real working-capital trade-off", () => {
    const s = initialState("CEO");
    const keep = chooseChapter(s, "reserve");
    const expand = chooseChapter(s, "expand");
    expect(preview(expand).quantity).toBeLessThan(preview(keep).quantity);
    expect(preview(expand).profit).toBeLessThan(preview(keep).profit);
    expect(s.cash).toBe(700);
    expect(s.decisions).toEqual([]);
    expect(expand.purchases[0].cost).toBe(120);
    expect(() => chooseChapter(expand, "people")).toThrow();
  });
  it("rejects invalid, unstarted, unaffordable and blocked choices atomically", () => {
    expect(() => chooseChapter(initialState(), "reserve")).toThrow();
    expect(() => chooseChapter(initialState("CEO"), "invalid")).toThrow();
    const poor = { ...initialState("CEO"), cash: 130 };
    expect(() => chooseChapter(poor, "people")).toThrow();
    expect(poor.cash).toBe(130);
    expect(poor.purchases).toHaveLength(0);
    const bankrupt = { ...poor, cash: 110 };
    expect(() => chooseChapter(bankrupt, "reserve")).toThrow();
    const final = advance(advance(advance(initialState("CEO"))));
    expect(() => chooseChapter(final, "europe")).toThrow();
    expect(final.market).toBe("domestic");
  });
  it("does not charge twice for existing upgrades", () => {
    const s = purchase(initialState("CEO"), "training");
    const next = chooseChapter(s, "people");
    expect(next.cash).toBe(s.cash);
    expect(next.purchases).toHaveLength(1);
  });
  it("supports a deterministic balanced winning path and save round trips", () => {
    const play = () => {
      let s = initialState("CEO");
      for (const id of ["people", "trace", "route", "regional"]) {
        s = chooseChapter(s, id);
        expect(isValidSave(JSON.parse(JSON.stringify(s)))).toBe(true);
        const projection = preview(s);
        s = advance(s);
        expect(s.history.at(-1)).toEqual(projection);
        expect(projection.endingCash).toBeCloseTo(
          projection.openingCash -
            projection.investments -
            projection.variableCost -
            projection.wages -
            projection.fixedExpenses +
            projection.revenue,
        );
      }
      return s;
    };
    const result = play();
    expect(result).toEqual(play());
    expect(competitiveness(result).checks.filter((c) => !c.done)).toEqual([]);
    expect(isValidSave(result)).toBe(true);
    expect(() => chooseChapter(result, "regional")).toThrow();
  });
  it("permits prepared EU sales without assuming the expensive strategy wins", () => {
    let s = advance(chooseChapter(initialState("CEO"), "people"));
    s = purchase(s, "traceability");
    s = advance({ ...chooseChapter(s, "automation"), market: "eu" });
    s = advance(chooseChapter(s, "route"));
    s = advance(chooseChapter(s, "europe"));
    expect(s.history.at(-1)?.market).toBe("eu");
    expect(
      competitiveness(s).checks.find((c) => c.name === "Cạnh tranh quốc tế")
        ?.done,
    ).toBe(true);
    expect(competitiveness(s).won).toBe(false);
    expect(competitiveness(scenarios().a).won).toBe(false);
  });
  it("explores all reachable chapter paths and reconciles every result", () => {
    let states: GameState[] = [initialState("CEO")];
    for (const chapter of chapters) {
      const next: GameState[] = [];
      for (const s of states)
        for (const c of chapter.choices) {
          let chosen;
          try {
            chosen = chooseChapter(s, c.id);
          } catch {
            continue;
          }
          const operated = advance(chosen),
            r = operated.history.at(-1)!;
          expect(r.endingCash).toBeGreaterThanOrEqual(0);
          expect(r.endingCash).toBeCloseTo(
            r.openingCash -
              r.investments -
              r.variableCost -
              r.wages -
              r.fixedExpenses +
              r.revenue,
          );
          expect(typeof chapterAchieved(r)).toBe("boolean");
          expect(isValidSave(operated)).toBe(true);
          next.push(operated);
        }
      expect(next.length).toBeGreaterThan(0);
      states = next;
    }
    expect(states.some((s) => competitiveness(s).won)).toBe(true);
    expect(states.some((s) => !competitiveness(s).won)).toBe(true);
  });
  it("accepts old saves but rejects corrupt decision records", () => {
    const s = chooseChapter(initialState("CEO"), "people");
    const { decisions: _decisions, ...legacy } = s;
    expect(isValidSave(legacy)).toBe(true);
    expect(
      isValidSave({ ...s, decisions: [s.decisions![0], s.decisions![0]] }),
    ).toBe(false);
    expect(
      isValidSave({
        ...s,
        decisions: [
          { ...s.decisions![0], forecast: { quarter: 1, market: "domestic" } },
        ],
      }),
    ).toBe(false);
    expect(isValidSave({ ...s, decisions: [null] })).toBe(false);
  });
});
