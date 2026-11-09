import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, RefreshCw } from "lucide-react";
import { useGame } from "../store/gameStore";
import {
  askAdvisor,
  fallback,
  type AdvisorReply,
} from "../services/advisorApi";
export function Advisor() {
  const game = useGame((s) => s.game);
  const [reply, setReply] = useState<AdvisorReply>(() => fallback(game));
  const [busy, setBusy] = useState(false);
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState("");
  const active = useRef(0);
  async function ask(q?: string) {
    const id = ++active.current;
    setBusy(true);
    setAsked(q || "Phân tích tình hình doanh nghiệp");
    const result = await askAdvisor(game, q);
    if (id === active.current) {
      setReply(result);
      setBusy(false);
    }
  }
  useEffect(() => {
    void ask();
    return () => {
      active.current++;
    };
  }, [game]);
  return (
    <div className="advisor-layout">
      <div className="panel advisor-main">
        <div className="panel-heading">
          <div className="advisor-avatar">
            <Bot size={25} />
          </div>
          <div>
            <h3>Marx AI Advisor</h3>
            <span>Cố vấn kinh tế của bạn</span>
          </div>
          <span className="pill muted">
            {busy
              ? "Đang kết nối…"
              : reply.mode === "gemini"
                ? "Gemini · Trực tiếp"
                : "Chế độ dự phòng"}
          </span>
        </div>
        <div className="conversation" aria-live="polite">
          {asked && <div className="user-bubble">{asked}</div>}
          <div className="advisor-bubble">
            <Sparkles size={18} />
            <div>
              {busy ? (
                <p>Đang phân tích dữ liệu đã tính toán của doanh nghiệp…</p>
              ) : (
                <>
                  <strong>
                    {reply.mode === "demo"
                      ? "Giải thích giáo dục có sẵn"
                      : "Phân tích từ Gemini"}
                  </strong>
                  <p>{reply.message}</p>
                  {reply.mode === "demo" && (
                    <small>
                      Chưa có phản hồi AI trực tiếp. Bạn vẫn có thể tiếp tục
                      chơi.
                    </small>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <form
          className="chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (question.trim()) {
              void ask(question.trim());
              setQuestion("");
            }
          }}
        >
          <input
            aria-label="Câu hỏi cho cố vấn"
            maxLength={2000}
            placeholder="Hỏi về đầu tư, chu chuyển, giá trị thặng dư…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            className="primary icon-button"
            disabled={busy || !question.trim()}
            aria-label="Gửi câu hỏi"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
      <div className="panel">
        <h3>Cùng suy nghĩ</h3>
        <p className="subtle">Kết nối quyết định kinh doanh với lý luận.</p>
        {[
          "Giá trị thặng dư khác lợi nhuận thế nào?",
          "Logistics ảnh hưởng chu chuyển ra sao?",
          "Tái sản xuất mở rộng là gì?",
          "So sánh kết quả hai chiến lược đầu tư",
        ].map((q) => (
          <button
            key={q}
            className="question"
            disabled={busy}
            onClick={() => void ask(q)}
          >
            {q}
            <Send size={14} />
          </button>
        ))}
        <button
          className="secondary"
          disabled={busy}
          onClick={() => void ask()}
        >
          <RefreshCw size={15} /> Phân tích lại
        </button>
        <p className="fine-print">
          Cố vấn chỉ giải thích và gợi ý. Tất cả kết quả tài chính và điểm số do
          bộ máy mô phỏng xác định.
        </p>
      </div>
    </div>
  );
}
