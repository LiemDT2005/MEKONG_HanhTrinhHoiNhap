import type { GameState } from "../types/game";
import { knowledge } from "../data/marxKnowledge";
import { events } from "../data/gameConfig";
import { scenarios, preview } from "../engine/simulation";
import { chapters } from "../data/chapters";
export interface AdvisorReply {
  message: string;
  mode: "gemini" | "demo";
}
function advisorChapter(state: GameState) {
  const decision = state.decisions?.at(-1);
  const currentAction =
    state.purchases.some((p) => p.quarter === state.quarter) ||
    state.market !== state.history.at(-1)?.market;
  const chapter =
    state.quarter <= 4 && currentAction
      ? state.quarter
      : (decision?.chapter ?? Math.min(state.quarter, 4));
  return chapters[chapter - 1];
}
export function fallback(state: GameState, question = ""): AdvisorReply {
  const q = question.toLocaleLowerCase("vi"),
    found =
      knowledge.find((x) => q.includes(x.title.toLocaleLowerCase("vi"))) ||
      (q.includes("thặng dư")
        ? knowledge[3]
        : q.includes("logistics") || q.includes("chu chuyển")
          ? knowledge[5]
          : q.includes("c/v")
            ? knowledge[4]
            : null);
  const last = state.history.at(-1);
  const decision = state.decisions?.at(-1);
  const chapter = advisorChapter(state);
  let projection;
  try {
    projection = preview(state);
  } catch {
    /* Final or blocked state. */
  }
  const describe = (r: NonNullable<typeof last>) =>
    `${r.quantity}/${r.capacity} tấn, lãi kế toán ${r.profit} triệu, tiền cuối kỳ ${r.endingCash} triệu, chu kỳ ${r.turnoverDays} ngày. ${r.warnings.join(" ")}`;
  const selected = decision
    ? chapters[decision.chapter - 1].choices.find(
        (c) => c.id === decision.choice,
      )
    : undefined;
  const analysis = `Hệ quả tài chính và vận hành: ${selected && decision ? `Lựa chọn ${selected.title}; tiền lúc chọn ${decision.cashBefore} → ${decision.cashAfter} triệu. ` : ""}${last ? `Kết quả chương ${last.quarter} đã chốt: ${describe(last)} ` : ""}${projection ? `Dự toán chương ${state.quarter} theo kế hoạch hiện tại: ${describe(projection)}` : state.quarter <= 4 ? "Chưa có dự toán khả thi; hãy giữ đủ vốn vận hành." : "Đã kết thúc bốn chương."}\n\nLiên hệ lý luận: ${chapter.theory}\n\nCâu hỏi phản biện: ${chapter.question}\n\nGợi ý thực hành: So sánh dự toán trước khi chi thêm. Công suất không dùng hết và chi tuân thủ có thể triệt tiêu lợi ích giá bán; kiểm tra tiền sau đầu tư thay vì chọn phương án đắt nhất. ${chapter.lesson}\n\nMọi số liệu và ngưỡng thị trường là giả định giáo dục; lợi nhuận kế toán không tự động bằng m.`;
  return {
    mode: "demo",
    message: found
      ? `${found.formula}\n\n${found.text}\n\n${analysis}`
      : analysis,
  };
}
export async function askAdvisor(
  state: GameState,
  question?: string,
): Promise<AdvisorReply> {
  const base = (import.meta.env.VITE_API_BASE_URL || "")
    .trim()
    .replace(/\/+$/, "");
  let projection;
  try {
    projection = preview(state);
  } catch {
    /* Completed or blocked production has no projection. */
  }
  const context = {
    ...state,
    currentEvent: events[Math.min(4, state.quarter) - 1],
    projection,
    chapter: advisorChapter(state),
    scenarioComparison: scenarios(),
  };
  try {
    const res = await fetch(
      `${base}/api/advisor/${question ? "chat" : "analyze"}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: context, question }),
        signal: AbortSignal.timeout(22000),
      },
    );
    if (!res.ok) throw new Error("API unavailable");
    const data = await res.json();
    if (
      typeof data.message !== "string" ||
      !["demo", "gemini"].includes(data.mode)
    )
      throw new Error("Invalid response");
    return data.mode === "demo" ? fallback(state, question) : data;
  } catch {
    return fallback(state, question);
  }
}
