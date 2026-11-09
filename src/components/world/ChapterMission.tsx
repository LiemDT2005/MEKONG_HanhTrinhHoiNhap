import { useEffect, useState } from "react";
import { chapters } from "../../data/chapters";
import { markets, upgrades } from "../../data/gameConfig";
import {
  chapterAchieved,
  chooseChapter,
  competitiveness,
} from "../../engine/chapters";
import { useGame } from "../../store/gameStore";
import {
  askAdvisor,
  fallback,
  type AdvisorReply,
} from "../../services/advisorApi";
import { money } from "../../utils/currency";
import { GameDialog } from "./GameDialog";
import type { GameState, QuarterResult } from "../../types/game";

export function ChapterArt({ chapter }: { chapter: number }) {
  return (
    <svg
      className={`chapter-art chapter-art-${chapter}`}
      viewBox="0 0 640 150"
      role="img"
      aria-label={
        [
          "Doanh nghiệp nhỏ bên dòng Mekong",
          "Người lao động và dây chuyền mới",
          "Đoàn xe chờ tàu tại cảng",
          "Tàu gạo hướng ra thị trường quốc tế",
        ][chapter - 1]
      }
    >
      <rect width="640" height="150" fill="#d5eddf" />
      <circle cx="540" cy="34" r="22" fill="#f4c867" />
      <path d="M0 110 Q160 60 330 110 T640 102 V150 H0Z" fill="#88bda4" />
      <path d="M0 130 Q240 86 640 128 V150 H0Z" fill="#4f9fa3" />
      <g fill="#faf0cb" stroke="#315f50" strokeWidth="3">
        <path d="M65 109 V61 L132 36 L199 61 V109Z" />
        <path d="M199 109 V62 H294 V109Z" />
        <path d="M81 71 H116 V109 H81Z" fill="#446c55" />
        <path
          d="M220 76 H242 V91 H220Z M258 76 H280 V91 H258Z"
          fill="#e0b25a"
        />
        {chapter === 2 && (
          <>
            <path d="M213 40 H289 V57 H213Z" fill="#e3b65e" />
            <circle cx="247" cy="89" r="16" fill="#8eb1ac" />
          </>
        )}
      </g>
      <g stroke="#315f50" strokeWidth="3">
        <circle cx="332" cy="77" r="9" fill="#e7b87e" />
        <path d="M332 86 V110 M319 96 H345 M332 110 L321 126 M332 110 L342 126" />
      </g>
      {chapter >= 3 && (
        <g>
          <path d="M384 89 H456 V116 H384Z" fill="#dba548" />
          <path d="M456 99 H479 V116 H456Z" fill="#f8edce" />
          <circle cx="400" cy="118" r="9" fill="#35594e" />
          <circle cx="463" cy="118" r="9" fill="#35594e" />
        </g>
      )}
      {chapter === 3 && (
        <path
          d="M500 68 H607 M555 68 V118 M500 68 L555 36 L607 68"
          fill="none"
          stroke="#ac704d"
          strokeWidth="5"
        />
      )}
      {chapter === 4 && (
        <g>
          <path d="M489 121 H623 L608 141 H508Z" fill="#315f50" />
          <path d="M514 99 H597 V120 H514Z" fill="#e9b253" />
          <path
            d="M555 99 V50 L605 82 H555"
            fill="#faf0cb"
            stroke="#315f50"
            strokeWidth="3"
          />
        </g>
      )}
    </svg>
  );
}

export function DecisionAdvisor({ game }: { game: GameState }) {
  const [reply, setReply] = useState<AdvisorReply>(() => fallback(game));
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    setReply(fallback(game));
    setBusy(true);
    void askAdvisor(game).then((r) => {
      if (active) {
        setReply(r);
        setBusy(false);
      }
    });
    return () => {
      active = false;
    };
  }, [game]);
  return (
    <section className="chapter-advisor" aria-live="polite">
      <strong>
        Cố vấn phản biện ·{" "}
        {busy
          ? "Đang kết nối AI; diễn giải có sẵn"
          : reply.mode === "gemini"
            ? "AI trực tiếp"
            : "Diễn giải có sẵn"}
      </strong>
      <p>{reply.message}</p>
      <small>Cố vấn chỉ diễn giải; không thay đổi phép tính.</small>
    </section>
  );
}

export function ChapterMission({ active = true }: { active?: boolean }) {
  const { game, choose } = useGame();
  const [dismissed, setDismissed] = useState(0);
  const [open, setOpen] = useState(false);
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [error, setError] = useState("");
  const chapter = chapters[Math.min(4, game.quarter) - 1];
  const decision = game.decisions?.find((d) => d.chapter === game.quarter);
  const done = game.quarter > 4;
  const show =
    active && !done && (open || (!decision && dismissed !== game.quarter));
  return (
    <section className="chapter-mission">
      <div className="chapter-banner">
        <div>
          <span className="world-eyebrow">
            CHƯƠNG {Math.min(4, game.quarter)} / 4 · CHIẾN LƯỢC KINH TẾ
          </span>
          <h2>{chapter.title}</h2>
          <p>
            {done
              ? "Hành trình hoàn tất. Xem lại bài học và năng lực cạnh tranh."
              : chapter.objective}
          </p>
        </div>
        {!done && (
          <button className="game-secondary" onClick={() => setOpen(true)}>
            {decision ? "Xem quyết định" : "Nhận nhiệm vụ"}
          </button>
        )}
      </div>
      {game.history.at(-1) && (
        <details className="chapter-journal">
          <summary>
            Báo cáo chương {game.history.at(-1)!.quarter} ·{" "}
            {chapterAchieved(game.history.at(-1)!)
              ? "Đạt thành tựu"
              : "Bài học cần cải thiện"}
          </summary>
          <ChapterReport game={game} result={game.history.at(-1)!} />
        </details>
      )}
      {(decision || game.purchases.length > 0 || game.history.length > 0) && (
        <details
          className="chapter-journal"
          onToggle={(e) => setAdvisorOpen(e.currentTarget.open)}
        >
          <summary>Đối thoại với cố vấn kinh tế</summary>
          {advisorOpen && <DecisionAdvisor game={game} />}
        </details>
      )}
      {show && (
        <GameDialog
          wide
          title={chapter.title}
          onClose={() => {
            setDismissed(game.quarter);
            setOpen(false);
          }}
        >
          <ChapterArt chapter={game.quarter} />
          <p className="character-dialogue">
            <strong>{chapter.speaker}</strong>
            <br />“{chapter.dialogue}”
          </p>
          <p>
            <strong>Nhiệm vụ:</strong> {chapter.objective}
          </p>
          <div className="chapter-choices">
            {chapter.choices.map((c) => {
              let next: GameState | undefined,
                reason = "";
              try {
                if (!decision) next = chooseChapter(game, c.id);
              } catch (e) {
                reason = (e as Error).message;
              }
              const d = next?.decisions?.at(-1);
              const cost = c.upgrades
                .filter((id) => !game.upgrades.includes(id))
                .reduce(
                  (n, id) => n + upgrades.find((u) => u.id === id)!.cost,
                  0,
                );
              return (
                <article
                  className={decision?.choice === c.id ? "selected-choice" : ""}
                  key={c.id}
                >
                  <h3>{c.title}</h3>
                  <p>{c.benefit}</p>
                  <p>
                    <strong>Đánh đổi:</strong> {c.risk}
                  </p>
                  <small>
                    Chi thêm thực tế: {cost} triệu · nâng cấp đã sở hữu không
                    mua lại.
                  </small>
                  {d && (
                    <p className="choice-forecast">
                      Dự toán: {d.forecast.quantity} tấn · lãi{" "}
                      {money(d.forecast.profit)} triệu · tiền cuối{" "}
                      {money(d.forecast.endingCash)} triệu ·{" "}
                      {d.forecast.turnoverDays} ngày.
                    </p>
                  )}
                  {reason && <p className="error">{reason}</p>}
                  <button
                    className="game-primary full"
                    disabled={!!decision || !!reason}
                    onClick={() => {
                      try {
                        choose(c.id);
                        setError("");
                        setDismissed(game.quarter);
                        setOpen(false);
                      } catch (e) {
                        setError((e as Error).message);
                      }
                    }}
                  >
                    {decision?.choice === c.id ? "Đã chọn" : "Chọn chiến lược"}
                  </button>
                </article>
              );
            })}
          </div>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <p className="fine-print">
            Mỗi chương chạy một kỳ kế toán 90 ngày. Bạn vẫn có thể bổ sung đầu
            tư và đổi thị trường tại công trình; kết quả cuối dùng kế hoạch thực
            tế khi vận hành. Mọi tham số đều giả định giáo dục.
          </p>
        </GameDialog>
      )}
    </section>
  );
}

export function DecisionFeedback() {
  const { game, advicePending, closeAdvice } = useGame();
  return advicePending ? (
    <GameDialog title="Cùng phản biện quyết định" onClose={closeAdvice}>
      <DecisionAdvisor game={game} />
      <button className="game-primary full" onClick={closeAdvice}>
        Tiếp tục hành trình
      </button>
    </GameDialog>
  ) : null;
}

export function ChapterReport({
  game,
  result: r,
}: {
  game: GameState;
  result: QuarterResult;
}) {
  const chapter = chapters[r.quarter - 1];
  const d = game.decisions?.find((d) => d.chapter === r.quarter);
  const choice = chapter.choices.find((c) => c.id === d?.choice);
  const purchases = game.purchases.filter((p) => p.quarter === r.quarter);
  return (
    <article className="chapter-report">
      <h3>
        Chương {r.quarter} · {chapter.title}
      </h3>
      <p>
        <strong>Vấn đề ban đầu:</strong> {chapter.dialogue}
      </p>
      <p>
        <strong>Quyết định:</strong>{" "}
        {choice?.title ?? "Lượt chơi cũ: không có nhật ký lựa chọn chiến lược."}{" "}
        Thực thi: {markets[r.market].name};{" "}
        {purchases.length
          ? purchases
              .map((p) => upgrades.find((u) => u.id === p.id)!.name)
              .join(", ")
          : "không mua thêm nâng cấp"}
        .
      </p>
      <p>
        <strong>Kết quả thực tế:</strong> {r.quantity}/{r.capacity} tấn · chất
        lượng {r.quality}/100 · chu kỳ {r.turnoverDays} ngày (
        {r.turnoverFrequency} vòng/năm) · lãi hoạt động{" "}
        {money(r.operatingProfit)} · lãi kế toán {money(r.profit)} triệu.
      </p>
      <p>
        Tiền đầu kỳ {money(r.openingCash)} − đầu tư {money(r.investments)} − chi
        vận hành {money(r.variableCost + r.wages + r.fixedExpenses)} + doanh thu{" "}
        {money(r.revenue)} = {money(r.endingCash)} triệu cuối kỳ.
      </p>
      {d && (
        <p>
          Dự toán lúc chọn: {d.forecast.quantity} tấn, lãi{" "}
          {money(d.forecast.profit)} triệu.{" "}
          {d.forecast.profit !== r.profit || d.forecast.market !== r.market
            ? "Kế hoạch đã thay đổi sau lựa chọn; kết quả dùng trạng thái khi chốt vận hành."
            : "Kết quả khớp dự toán lúc chọn."}
        </p>
      )}
      <p>
        <strong>Lý luận:</strong> {chapter.theory}
      </p>
      <p>
        <strong>Bài học:</strong> {chapter.lesson}
      </p>
      <p>
        <strong>Tự phản biện:</strong> {chapter.question}
      </p>
      <p className={chapterAchieved(r) ? "positive" : "subtle"}>
        {chapterAchieved(r)
          ? `Thành tựu: ${chapter.achievement}`
          : `Chưa đạt mục tiêu: ${chapter.objective}`}
      </p>
    </article>
  );
}

export function EducationalReport({ game }: { game: GameState }) {
  const progress = competitiveness(game);
  return (
    <section className="educational-report">
      <div className="panel">
        <h2>
          {game.quarter <= 4
            ? "Năng lực cạnh tranh đang hình thành"
            : progress.won
              ? "Chiến thắng · Hội nhập bền vững"
              : "Hoàn thành hành trình · Cần củng cố năng lực"}
        </h2>
        <p>
          Thắng khi hoàn tất bốn chương và đạt đủ năm điều kiện dưới đây. Đây là
          thước đo học tập giả định, không phải đánh giá doanh nghiệp thực tế.
        </p>
        {progress.checks.map((c) => (
          <p key={c.name}>
            <strong>
              {c.done ? "✓" : "○"} {c.name}:
            </strong>{" "}
            {c.detail}
          </p>
        ))}
        <p>
          Tích lũy thể hiện qua tài sản và dự trữ; công nghệ cần sản lượng và
          lãi vận hành; đào tạo nâng chất lượng và rút chu kỳ; logistics giảm
          chi phí và lưu thông. Không chỉ tiêu nào riêng lẻ bảo đảm cạnh tranh.
        </p>
        <p>
          Giới hạn: không mô phỏng vay, thuế, tồn kho, công nợ hoặc tác động
          sinh thái. Chu kỳ ngắn không tự nhân doanh thu; toàn bộ sản phẩm làm
          ra được bán trong kỳ. Không suy ra c, v, m hay giá trị thặng dư từ báo
          cáo kế toán.
        </p>
        <p>
          Thông tin thực tế: EVFTA và RCEP có quy tắc xuất xứ; điều kiện tiếp
          cận và ưu đãi phụ thuộc hàng hóa và thị trường. Các ngưỡng 60/80, giá,
          nhu cầu và phí trong game đều giả định. Nguồn:{" "}
          <a
            href="https://policy.trade.ec.europa.eu/eu-trade-relationships-country-and-region/countries-and-regions/viet-nam/eu-viet-nam-agreements/texts-agreements_en"
            target="_blank"
            rel="noreferrer"
          >
            Văn bản EVFTA · Ủy ban châu Âu
          </a>{" "}
          ·{" "}
          <a
            href="https://www.mfat.govt.nz/en/trade/free-trade-agreements/free-trade-agreements-in-force/regional-comprehensive-economic-partnership-rcep/rcep-text-and-resources"
            target="_blank"
            rel="noreferrer"
          >
            Văn bản RCEP · Bộ Ngoại giao và Thương mại New Zealand
          </a>
          .
        </p>
      </div>
      {game.history.map((r) => (
        <div className="panel" key={r.quarter}>
          <ChapterReport game={game} result={r} />
        </div>
      ))}
    </section>
  );
}
