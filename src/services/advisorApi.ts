import type { GameState } from "../types/game";
import { knowledge } from "../data/marxKnowledge";
import { events } from "../data/gameConfig";
import { scenarios, preview } from "../engine/simulation";
export interface AdvisorReply {
  message: string;
  mode: "gemini" | "demo";
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
  return {
    mode: "demo",
    message: found
      ? `${found.formula}\n\n${found.text}`
      : `${last ? `Quý ${last.quarter} đã ghi nhận ${last.quantity} tấn bán ra. ${last.warnings.length ? "Vốn lưu động đang hạn chế sản lượng." : "Hãy đối chiếu lợi nhuận với số dư tiền sau đầu tư."}` : "Hãy giữ đủ tiền cho nguyên liệu, lương và chi phí cố định trước khi đầu tư."}\n\nĐào tạo và truy xuất giúp cải thiện chất lượng; máy sấy tăng năng lực nhưng cần thêm vốn vận hành. Đọc dự toán để cân đối quy mô với thanh khoản. Lợi nhuận kế toán không tự động bằng giá trị thặng dư.\n\nMọi số liệu và điều kiện thị trường là giả định giáo dục.`,
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
    return data;
  } catch {
    return fallback(state, question);
  }
}
