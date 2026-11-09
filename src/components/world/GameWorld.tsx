import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  Coins,
  Factory,
  Flag,
  Globe2,
  GraduationCap,
  HelpCircle,
  Leaf,
  MapPin,
  PackageCheck,
  Play,
  ShieldCheck,
  Sparkles,
  Sprout,
  Timer,
  TrendingUp,
  TriangleAlert,
  Truck,
  Wallet,
  Wheat,
  X,
} from "lucide-react";
import { useGame } from "../../store/gameStore";
import { events, markets, upgrades } from "../../data/gameConfig";
import {
  lockedReason,
  preview,
  purchase,
  score,
} from "../../engine/simulation";
import type {
  GameState,
  QuarterResult,
  Upgrade,
  UpgradeId,
} from "../../types/game";
import { money } from "../../utils/currency";
import { BusinessMap, buildings, type BuildingId } from "./BusinessMap";
import { GameDialog } from "./GameDialog";

const icons: Record<UpgradeId, typeof Factory> = {
  dryer: Factory,
  sorter: PackageCheck,
  training: GraduationCap,
  logistics: Truck,
  traceability: ShieldCheck,
  cooperative: Sprout,
};
function safePreview(game: GameState) {
  try {
    return { result: preview(game), error: "" };
  } catch (e) {
    return { result: undefined, error: (e as Error).message };
  }
}
export function ResourceHud() {
  const game = useGame((s) => s.game),
    estimate = safePreview(game).result,
    last = game.history.at(-1);
  const days =
    estimate?.turnoverDays ?? last?.turnoverDays ?? game.turnoverDays;
  return (
    <div className="resource-hud" aria-label="Tài nguyên doanh nghiệp">
      <div className="resource resource-money">
        <span className="resource-icon">
          <Coins size={19} />
        </span>
        <div>
          <small>TIỀN MẶT</small>
          <strong>
            {money(game.cash)}
            <span> tr.đ</span>
          </strong>
        </div>
      </div>
      <div className="resource">
        <span className="resource-icon">
          <Factory size={18} />
        </span>
        <div>
          <small>CÔNG SUẤT</small>
          <strong>
            {game.capacity}
            <span> tấn/quý</span>
          </strong>
        </div>
      </div>
      <div className="resource resource-quality">
        <span className="resource-icon">
          <Wheat size={19} />
        </span>
        <div>
          <small>CHẤT LƯỢNG</small>
          <strong>
            {game.quality}
            <span> /100</span>
          </strong>
        </div>
      </div>
      <div className="resource resource-time">
        <span className="resource-icon">
          <Timer size={19} />
        </span>
        <div>
          <small>CHU CHUYỂN</small>
          <strong>
            {days}
            <span> ngày</span>
          </strong>
        </div>
      </div>
    </div>
  );
}

export function GameWorld() {
  const { game, buy, run } = useGame(),
    navigate = useNavigate(),
    reduced = useReducedMotion();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState<BuildingId | null>(null),
    [upgrade, setUpgrade] = useState<Upgrade | null>(null),
    [eventOpen, setEventOpen] = useState(false),
    [guideOpen, setGuideOpen] = useState(false),
    [eventSeen, setEventSeen] = useState(false),
    [phase, setPhase] = useState<"idle" | "confirm" | "running" | "result">(
      () =>
        searchParams.get("operate") === "1" && game.quarter <= 4
          ? "confirm"
          : "idle",
    ),
    [result, setResult] = useState<QuarterResult | null>(null),
    [toast, setToast] = useState(""),
    [error, setError] = useState("");
  const committing = useRef(false),
    completed = game.quarter > 4,
    quarter = Math.min(game.quarter, 4),
    event = events[quarter - 1],
    estimate = safePreview(game),
    points = score(game),
    last = game.history.at(-1);
  const panelRef = useRef<HTMLElement>(null),
    mapRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (searchParams.has("operate"))
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          next.delete("operate");
          return next;
        },
        { replace: true },
      );
  }, [searchParams, setSearchParams]);
  useEffect(() => {
    if (selected && window.matchMedia("(max-width: 1000px)").matches)
      panelRef.current?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "start",
      });
  }, [selected, reduced]);
  function closeBuilding() {
    setSelected(null);
    if (window.matchMedia("(max-width: 1000px)").matches)
      mapRef.current?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "start",
      });
  }
  useEffect(() => {
    if (phase !== "running") return;
    const timer = setTimeout(() => setPhase("result"), reduced ? 150 : 2400);
    return () => clearTimeout(timer);
  }, [phase, reduced]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  const purchasedThisQuarter = game.purchases.some(
    (p) => p.quarter === game.quarter,
  );
  function startQuarter() {
    if (committing.current) return;
    committing.current = true;
    try {
      const actual = preview(useGame.getState().game);
      run();
      setResult(actual);
      setPhase("running");
      setSelected(null);
      setError("");
    } catch (e) {
      setError((e as Error).message);
      committing.current = false;
    }
  }
  function finishResult() {
    setPhase("idle");
    setResult(null);
    setEventSeen(false);
    committing.current = false;
  }
  function invest() {
    if (!upgrade) return;
    try {
      const before = useGame.getState().game;
      buy(upgrade.id);
      const after = useGame.getState().game;
      setToast(
        `Đã hoàn thành ${upgrade.name.toLocaleLowerCase("vi")}${lockedReason(before, "eu") && !lockedReason(after, "eu") ? " · Đã mở thị trường EU" : lockedReason(before, "rcep") && !lockedReason(after, "rcep") ? " · Đã mở thị trường RCEP" : ""}`,
      );
      setUpgrade(null);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <div className="game-world">
      <div className="world-heading">
        <div>
          <div className="world-eyebrow">
            <span className="live-spark" /> CẦN THƠ · ĐỒNG BẰNG SÔNG CỬU LONG
          </div>
          <h1>
            {game.companyName}
            <span className="company-level">
              {game.upgrades.length === 0
                ? "Khởi nghiệp"
                : game.upgrades.length < 4
                  ? "Đang chuyển mình"
                  : "Sẵn sàng vươn xa"}
            </span>
          </h1>
        </div>
        <div className="world-heading-actions">
          <button
            className="world-help"
            onClick={() => setGuideOpen(true)}
            aria-label="Hướng dẫn chơi trên bản đồ"
          >
            <HelpCircle size={19} />
          </button>
          <div className="season-badge">
            <span>{completed ? "HÀNH TRÌNH" : "LƯỢT KINH DOANH"}</span>
            <strong>
              {completed ? "Hoàn thành" : `Quý ${quarter}`}
              <small>{completed ? "4/4 quý" : " / 4"}</small>
            </strong>
          </div>
        </div>
      </div>
      <div className="turn-steps" aria-label="Các bước trong quý">
        <button
          className={eventSeen ? "done" : "active"}
          onClick={() => setEventOpen(true)}
        >
          <span>{eventSeen ? <Check size={13} /> : "01"}</span>
          <div>
            <strong>Đón nhịp thị trường</strong>
            <small>Sự kiện quý {quarter}</small>
          </div>
          <ChevronRight size={15} />
        </button>
        <button
          className={purchasedThisQuarter ? "done" : ""}
          onClick={() => setSelected("factory")}
        >
          <span>{purchasedThisQuarter ? <Check size={13} /> : "02"}</span>
          <div>
            <strong>Chuẩn bị & đầu tư</strong>
            <small>{game.upgrades.length}/6 nâng cấp</small>
          </div>
          <ChevronRight size={15} />
        </button>
        <button onClick={() => setSelected("port")}>
          <span>03</span>
          <div>
            <strong>Chọn đường vươn xa</strong>
            <small>{markets[game.market].name}</small>
          </div>
          <ChevronRight size={15} />
        </button>
        <button
          className="turn-step-run"
          onClick={() =>
            completed ? navigate("/game/report") : setPhase("confirm")
          }
        >
          <span>{completed ? <Check size={13} /> : "04"}</span>
          <div>
            <strong>
              {completed ? "Nhìn lại hành trình" : "Vận hành quý này"}
            </strong>
            <small>
              {completed ? `${points.total}/100 điểm` : "Sản xuất & bán hàng"}
            </small>
          </div>
          <Play size={14} />
        </button>
      </div>
      <div className="world-layout">
        <section
          className="world-map-card"
          ref={mapRef}
          aria-label="Khu doanh nghiệp của bạn"
        >
          <div className="map-card-header">
            <div>
              <span className="map-mini-icon">
                <MapPin size={13} />
              </span>
              <strong>Khu doanh nghiệp của bạn</strong>
            </div>
            <span className="map-live">
              <span />{" "}
              {completed
                ? "Hành trình đã hoàn thành"
                : estimate.result
                  ? "Sẵn sàng hoạt động"
                  : "Cần cân đối vốn"}
            </span>
          </div>
          <div className="world-map-stage">
            <BusinessMap
              game={game}
              selected={selected}
              onSelect={(id) => {
                setSelected(id);
                setError("");
              }}
              running={phase === "running"}
            />
            <div className="map-tip">
              <span className="map-tip-dot" />
              <span>Chạm một công trình để khám phá</span>
            </div>
            <div className="map-legend">
              <span>
                <i /> Công trình hiện có
              </span>
              <span>
                <i /> Đã nâng cấp
              </span>
            </div>
          </div>
          <div
            className="mobile-building-picker"
            aria-label="Chọn công trình trên điện thoại"
          >
            {(
              [
                { id: "fields", label: "Nguyên liệu", icon: Sprout },
                { id: "factory", label: "Nhà máy", icon: Factory },
                { id: "training", label: "Nhân sự", icon: GraduationCap },
                { id: "office", label: "Văn phòng", icon: ShieldCheck },
                { id: "port", label: "Bến cảng", icon: Truck },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                aria-label={`Chọn công trình ${buildings[id].name}`}
                aria-pressed={selected === id}
                onClick={() => setSelected(id)}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
            <button onClick={() => setGuideOpen(true)}>
              <HelpCircle size={16} /> Cách chơi
            </button>
          </div>
          <div className="map-command-bar">
            <div>
              <span className="market-token">
                <Globe2 size={16} />
                {markets[game.market].name}
              </span>
              <span className="forecast-token">
                {completed
                  ? `Đã bán ${game.history.reduce((s, r) => s + r.quantity, 0)} tấn`
                  : `Dự toán ${estimate.result?.quantity ?? 0} / ${game.capacity} tấn`}
                <small>{completed ? "qua 4 quý" : "trong quý này"}</small>
              </span>
            </div>
            <button
              className="game-primary run-quarter"
              onClick={() => {
                setError("");
                completed ? navigate("/game/report") : setPhase("confirm");
              }}
            >
              {completed ? (
                <Award size={18} />
              ) : (
                <Play size={17} fill="currentColor" />
              )}
              {completed ? "Khám phá thành tích" : "Vận hành quý này"}
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
        <aside className="world-side-panel" ref={panelRef}>
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected}
                className="building-panel"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
              >
                <div className="building-panel-heading">
                  <span className="world-eyebrow">CÔNG TRÌNH CỦA BẠN</span>
                  <button
                    aria-label="Đóng thông tin công trình"
                    onClick={closeBuilding}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className={`building-portrait portrait-${selected}`}>
                  {selected === "fields" ? (
                    <Sprout />
                  ) : selected === "factory" ? (
                    <Factory />
                  ) : selected === "training" ? (
                    <GraduationCap />
                  ) : selected === "port" ? (
                    <Truck />
                  ) : (
                    <ShieldCheck />
                  )}
                  <span>{buildings[selected].subtitle}</span>
                </div>
                <h2>{buildings[selected].name}</h2>
                <p className="building-description">
                  {selected === "factory"
                    ? `Công suất ${game.capacity} tấn/quý. Nâng cấp dây chuyền để cải thiện năng suất và chất lượng.`
                    : selected === "fields"
                      ? "Nguồn lúa tốt là khởi đầu của chuỗi giá trị. Liên kết giúp giảm chi phí nguyên liệu."
                      : selected === "training"
                        ? `Chất lượng hiện tại: ${game.quality}/100. Kỹ năng của người lao động tạo nên khác biệt.`
                        : selected === "office"
                          ? "Nâng khả năng truy xuất, theo dõi tài chính và tìm lời giải cùng cố vấn kinh tế."
                          : "Tối ưu vận chuyển và chuẩn bị điều kiện tiếp cận thị trường nội địa, RCEP, EU."}
                </p>
                <div className="building-upgrades">
                  <span className="world-eyebrow">
                    {completed
                      ? "NHỮNG GÌ BẠN ĐÃ XÂY DỰNG"
                      : "PHÁT TRIỂN CÔNG TRÌNH"}
                  </span>
                  {buildings[selected].upgrades.map((id) => {
                    const u = upgrades.find((u) => u.id === id)!,
                      Icon = icons[id],
                      owned = game.upgrades.includes(id);
                    return (
                      <button
                        key={id}
                        className={`world-upgrade ${owned ? "owned" : ""}`}
                        disabled={owned || completed || game.cash < u.cost}
                        onClick={() => {
                          setUpgrade(u);
                          setError("");
                        }}
                      >
                        <span className="upgrade-symbol">
                          <Icon size={20} />
                        </span>
                        <div>
                          <strong>{u.name}</strong>
                          <small>
                            {owned
                              ? "Đã hoàn thành · đang có hiệu lực"
                              : completed
                                ? "Hành trình đã kết thúc"
                                : game.cash < u.cost
                                  ? "Chưa đủ tiền mặt"
                                  : `${u.cost} triệu đồng`}
                          </small>
                        </div>
                        {owned ? (
                          <CheckCircle2 size={17} />
                        ) : (
                          <ArrowUpRight size={16} />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="building-actions">
                  {selected === "factory" && (
                    <button
                      className="game-secondary"
                      onClick={() => navigate("/game/production")}
                    >
                      Xem kế hoạch sản xuất <ArrowRight size={15} />
                    </button>
                  )}
                  {selected === "port" && (
                    <button
                      className="game-secondary"
                      onClick={() => navigate("/game/markets")}
                    >
                      Mở bản đồ thị trường <Globe2 size={15} />
                    </button>
                  )}
                  {selected === "office" && (
                    <>
                      <button
                        className="game-secondary"
                        onClick={() => navigate("/game/report")}
                      >
                        Sổ tài chính & thành tích <TrendingUp size={15} />
                      </button>
                      <button
                        className="world-text-link"
                        onClick={() => navigate("/game/advisor")}
                      >
                        Trao đổi với cố vấn <Bot size={15} />
                      </button>
                    </>
                  )}
                </div>
                <div className="building-footnote">
                  <BookOpen size={14} />
                  <span>
                    Đầu tư có thể làm giảm vốn vận hành. Xem dự toán trước khi
                    quyết định.
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="missions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mission-panel"
              >
                <div className="mission-heading">
                  <Flag size={18} />
                  <span>Nhật ký hành trình</span>
                  <small>{String(quarter).padStart(2, "0")}</small>
                </div>
                <button
                  className={`event-card event-quarter-${quarter}`}
                  onClick={() => setEventOpen(true)}
                >
                  <div>
                    <span className="event-card-label">
                      {completed
                        ? "CHẶNG ĐƯỜNG VỪA QUA"
                        : `SỰ KIỆN · QUÝ ${quarter}`}
                    </span>
                    <span className="event-card-symbol">
                      {quarter === 4 ? (
                        <Truck size={24} />
                      ) : quarter === 3 ? (
                        <Globe2 size={24} />
                      ) : quarter === 2 ? (
                        <Factory size={24} />
                      ) : (
                        <Sprout size={24} />
                      )}
                    </span>
                  </div>
                  <h2>{event.name}</h2>
                  <p>{event.description}</p>
                  <span className="event-card-link">
                    Đọc tín hiệu thị trường <ArrowUpRight size={14} />
                  </span>
                </button>
                <div className="mission-checklist">
                  <span className="world-eyebrow">
                    {completed
                      ? "DẤU ẤN CỦA BẠN"
                      : "MỤC TIÊU GỢI Ý · KHÔNG BẮT BUỘC"}
                  </span>
                  {[
                    {
                      done: game.upgrades.length > 0,
                      title: "Gieo vốn cho tương lai",
                      description: `${game.upgrades.length}/6 khoản đầu tư đã thực hiện`,
                    },
                    {
                      done: game.quality >= 60,
                      title: "Nâng tầm hạt gạo",
                      description: `Chất lượng ${game.quality}/100 · mục tiêu 60`,
                    },
                    {
                      done: game.history.some(
                        (r) => r.market !== "domestic" && r.quantity > 0,
                      ),
                      title: "Vươn ra thị trường mới",
                      description: "Hoàn thành một quý xuất khẩu",
                    },
                  ].map((m) => (
                    <div
                      key={m.title}
                      className={`mission-item ${m.done ? "done" : ""}`}
                    >
                      <span>{m.done ? <Check size={12} /> : <span />}</span>
                      <div>
                        <strong>{m.title}</strong>
                        <small>{m.description}</small>
                      </div>
                    </div>
                  ))}
                </div>
                {last && (
                  <div className="last-harvest">
                    <div>
                      <Wheat size={15} />
                      <strong>Mùa gặt quý {last.quarter}</strong>
                    </div>
                    <span>
                      {last.quantity} tấn đã bán
                      <small className={last.profit < 0 ? "negative" : ""}>
                        {last.profit >= 0 ? "+" : ""}
                        {money(last.profit)} tr.đ lợi nhuận
                      </small>
                    </span>
                  </div>
                )}
                <button
                  className="world-advisor"
                  onClick={() => navigate("/game/advisor")}
                >
                  <span>
                    <Bot size={21} />
                  </span>
                  <div>
                    <strong>Một quyết định, nhiều góc nhìn</strong>
                    <small>Ghé thăm cố vấn kinh tế</small>
                  </div>
                  <ArrowUpRight size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
      <div className="world-bottom-note">
        <span>
          <Leaf size={13} /> Mỗi quyết định hôm nay, một nền tảng ngày mai.
        </span>
        <button onClick={() => navigate("/game/report")}>
          Sổ tài chính & so sánh chiến lược <ArrowUpRight size={13} />
        </button>
      </div>
      {upgrade && (
        <GameDialog
          title="Đầu tư cho bước tiến mới"
          onClose={() => setUpgrade(null)}
        >
          <div className="upgrade-dialog-title">
            <span>
              {(() => {
                const Icon = icons[upgrade.id];
                return <Icon size={30} />;
              })()}
            </span>
            <div>
              <h3>{upgrade.name}</h3>
              <small>
                {upgrade.category === "capex"
                  ? "Đầu tư tài sản cố định"
                  : "Chi phí đào tạo / dịch vụ"}
              </small>
            </div>
          </div>
          <p className="upgrade-dialog-effect">{upgrade.effect}</p>
          <div className="world-cost-row">
            <span>Vốn cần đầu tư</span>
            <strong>
              <Coins size={18} />
              {upgrade.cost}
              <small>triệu đồng</small>
            </strong>
          </div>
          <div className="world-cost-row">
            <span>Tiền còn lại sau mua</span>
            <strong>
              {money(game.cash - upgrade.cost)}
              <small>triệu đồng</small>
            </strong>
          </div>
          <UpgradeForecast game={game} upgrade={upgrade} />
          <p className="world-theory">
            <BookOpen size={17} />
            {upgrade.theory}
          </p>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button
            className="game-primary full"
            onClick={invest}
            disabled={game.cash < upgrade.cost || completed}
          >
            Xác nhận đầu tư <ArrowRight size={17} />
          </button>
        </GameDialog>
      )}
      {eventOpen && (
        <GameDialog
          title={event.name}
          onClose={() => {
            setEventOpen(false);
            setEventSeen(true);
          }}
        >
          <div className={`event-dialog-art event-quarter-${quarter}`}>
            <span>THÔNG ĐIỆP TỪ THỊ TRƯỜNG</span>
            {quarter === 4 ? (
              <Truck size={65} strokeWidth={1.2} />
            ) : quarter === 3 ? (
              <Globe2 size={65} strokeWidth={1.2} />
            ) : quarter === 2 ? (
              <Factory size={65} strokeWidth={1.2} />
            ) : (
              <Sprout size={65} strokeWidth={1.2} />
            )}
            <span>QUÝ {quarter} / 4</span>
          </div>
          <p>{event.description}</p>
          <div className="event-choice-note">
            <Flag size={18} />
            <p>
              {quarter === 1
                ? "Chọn một hướng đầu tư, nhưng đừng quên vốn mua lúa và trả lương."
                : quarter === 2
                  ? "Nâng cấp giúp tăng năng lực. Hãy kiểm tra lượng tiền còn lại cho sản xuất."
                  : quarter === 3
                    ? "Chất lượng và truy xuất là điều kiện trong game để mở các tuyến xuất khẩu."
                    : "Logistics đã nâng cấp sẽ giảm tác động gián đoạn. Kiểm tra chu kỳ và dự toán quý này."}
            </p>
          </div>
          <button
            className="game-primary full"
            onClick={() => {
              setEventSeen(true);
              setEventOpen(false);
            }}
          >
            Đã nắm tình hình <Check size={17} />
          </button>
          <p className="fine-print">
            Giá, chi phí và điều kiện đều là tham số giả định giáo dục.
          </p>
        </GameDialog>
      )}
      {guideOpen && (
        <GameDialog
          title="Chào mừng đến khu doanh nghiệp"
          onClose={() => setGuideOpen(false)}
        >
          <p>
            Bạn có 4 quý để phát triển doanh nghiệp. Hãy bắt đầu bằng một công
            trình trên bản đồ.
          </p>
          <div className="world-guide">
            {[
              {
                icon: Factory,
                title: "Nhà máy",
                text: "Nâng cấp máy sấy, máy tách màu và xem kế hoạch sản xuất.",
              },
              {
                icon: Sprout,
                title: "Vùng nguyên liệu",
                text: "Liên kết hợp tác xã để giảm chi phí lúa.",
              },
              {
                icon: GraduationCap,
                title: "Trung tâm nhân sự",
                text: "Đào tạo để nâng chất lượng và rút ngắn chu kỳ.",
              },
              {
                icon: Truck,
                title: "Bến cảng",
                text: "Tối ưu logistics, chọn thị trường bán hàng.",
              },
              {
                icon: ShieldCheck,
                title: "Văn phòng",
                text: "Đầu tư truy xuất, đọc báo cáo và gặp cố vấn.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <Icon size={22} />
                <div>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            className="game-primary full"
            onClick={() => setGuideOpen(false)}
          >
            Bắt tay vào điều hành <ArrowRight size={17} />
          </button>
        </GameDialog>
      )}
      {phase === "confirm" && (
        <GameDialog
          title={
            estimate.result
              ? `Chốt kế hoạch quý ${game.quarter}?`
              : "Cần cân đối lại nguồn vốn"
          }
          onClose={() => setPhase("idle")}
        >
          {estimate.result ? (
            <>
              <span className="world-eyebrow">
                ĐƠN HÀNG ĐÃ XÁC NHẬN · {markets[game.market].name}
              </span>
              <div className="confirm-production">
                <Factory size={40} />
                <strong>
                  {estimate.result.quantity}
                  <small> tấn gạo</small>
                </strong>
                <span>Sản xuất & bán hết trong quý</span>
              </div>
              <div className="world-cost-row">
                <span>Doanh thu dự kiến</span>
                <strong>
                  {money(estimate.result.revenue)}
                  <small>tr.đ</small>
                </strong>
              </div>
              <div className="world-cost-row">
                <span>Lợi nhuận kế toán</span>
                <strong
                  className={estimate.result.profit < 0 ? "negative" : ""}
                >
                  {money(estimate.result.profit)}
                  <small>tr.đ</small>
                </strong>
              </div>
              <div className="world-cost-row">
                <span>Tiền mặt cuối quý</span>
                <strong>
                  {money(estimate.result.endingCash)}
                  <small>tr.đ</small>
                </strong>
              </div>
              {estimate.result.warnings.map((w) => (
                <p className="world-alert" key={w}>
                  <TriangleAlert size={17} />
                  {w}
                </p>
              ))}
              <p className="world-theory">
                <BookOpen size={16} />
                Đầu tư đã trả không trừ tiền lần nữa. Khấu hao giảm lợi nhuận,
                không giảm tiền mặt. Lợi nhuận kế toán không đồng nhất với giá
                trị thặng dư.
              </p>
              {error && <p className="error">{error}</p>}
              <button className="game-primary full" onClick={startQuarter}>
                <Play size={17} fill="currentColor" /> Bắt đầu vận hành
              </button>
              <button
                className="world-text-link full"
                onClick={() => navigate("/game/production")}
              >
                Xem dự toán chi tiết <ArrowUpRight size={14} />
              </button>
            </>
          ) : (
            <>
              <p className="world-alert">
                <TriangleAlert size={20} />
                {estimate.error}
              </p>
              <button
                className="game-primary full"
                onClick={() => navigate("/game/markets")}
              >
                Điều chỉnh thị trường <Globe2 size={17} />
              </button>
              <button
                className="world-text-link full"
                onClick={() => setPhase("idle")}
              >
                Quay lại bản đồ
              </button>
            </>
          )}
        </GameDialog>
      )}
      {phase === "running" && result && (
        <div
          className="quarter-running"
          role="dialog"
          aria-modal="true"
          aria-label={`Đang vận hành quý ${result.quarter}`}
          onKeyDown={(e) => {
            if (e.key === "Escape") setPhase("result");
            if (e.key === "Tab") e.preventDefault();
          }}
        >
          <div className="running-scene" inert aria-hidden="true">
            <BusinessMap
              game={game}
              selected={null}
              onSelect={() => {}}
              running
            />
            <div className="running-scene-shade" />
          </div>
          <div className="running-caption">
            <span className="world-eyebrow">
              QUÝ {result.quarter} · {markets[result.market].name}
            </span>
            <h2>Mùa gặt đang về.</h2>
            <p>Nhà máy chế biến · Vận chuyển · Giao hàng</p>
            <div className="running-progress">
              <span />
            </div>
            <button autoFocus onClick={() => setPhase("result")}>
              Bỏ qua hoạt ảnh <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
      {phase === "result" && result && (
        <GameDialog
          title={
            result.profit >= 0
              ? "Một mùa gặt, một bước tiến."
              : "Một quý đầu tư, một bài học."
          }
          onClose={finishResult}
        >
          <div className="harvest-medal">
            <Wheat size={37} />
            <span>QUÝ {result.quarter} HOÀN TẤT</span>
          </div>
          <div className="harvest-results">
            <div>
              <small>DOANH THU</small>
              <strong>
                {money(result.revenue)}
                <span>tr.đ</span>
              </strong>
            </div>
            <div>
              <small>LỢI NHUẬN KẾ TOÁN</small>
              <strong className={result.profit < 0 ? "negative" : ""}>
                {money(result.profit)}
                <span>tr.đ</span>
              </strong>
            </div>
          </div>
          <div className="harvest-detail">
            <span>
              <PackageCheck size={17} />
              {result.quantity} tấn đã giao
            </span>
            <span>
              <Wallet size={17} />
              {money(result.endingCash)} tr.đ tiền mặt
            </span>
          </div>
          <div className="harvest-badges">
            {game.upgrades.includes("dryer") && (
              <span>
                <Factory size={14} /> Đổi mới sản xuất
              </span>
            )}
            {result.market !== "domestic" && result.quantity > 0 && (
              <span>
                <Globe2 size={14} /> Vươn ra thế giới
              </span>
            )}
            {game.upgrades.includes("training") && (
              <span>
                <GraduationCap size={14} /> Đầu tư con người
              </span>
            )}
          </div>
          {result.warnings.map((w) => (
            <p key={w} className="world-alert">
              <TriangleAlert size={16} />
              {w}
            </p>
          ))}
          <p className="world-theory">
            <BookOpen size={16} />
            {result.investmentExpenses > 0
              ? `Lợi nhuận đã bao gồm ${result.investmentExpenses} triệu chi phí đào tạo/dịch vụ trong quý. `
              : ""}
            Lợi nhuận kế toán không đồng nhất với giá trị thặng dư.
          </p>
          <button
            className="game-primary full"
            onClick={() => {
              finishResult();
              if (completed) navigate("/game/report");
            }}
          >
            {completed
              ? "Khám phá thành tích"
              : `Bước sang quý ${game.quarter}`}
            <ArrowRight size={17} />
          </button>
          <button
            className="world-text-link full"
            onClick={() => {
              finishResult();
              navigate("/game/advisor");
            }}
          >
            Lắng nghe cố vấn kinh tế <Sparkles size={15} />
          </button>
        </GameDialog>
      )}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast world-toast"
            role="status"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <CheckCircle2 size={20} />
            {toast}
            <button onClick={() => setToast("")} aria-label="Đóng thông báo">
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
function UpgradeForecast({
  game,
  upgrade,
}: {
  game: GameState;
  upgrade: Upgrade;
}) {
  try {
    const r = preview(purchase(game, upgrade.id));
    return (
      <div className="upgrade-forecast">
        <strong>
          <TrendingUp size={16} /> Dự toán sau đầu tư
        </strong>
        <p>
          {r.quantity} tấn sản xuất · {money(r.endingCash)} tr.đ tiền cuối quý
        </p>
        {r.warnings.map((w) => (
          <small key={w}>{w}</small>
        ))}
      </div>
    );
  } catch (e) {
    return (
      <p className="world-alert">
        <TriangleAlert size={17} />
        {(e as Error).message}
      </p>
    );
  }
}
