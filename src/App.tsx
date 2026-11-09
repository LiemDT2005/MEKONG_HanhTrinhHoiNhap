import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  Factory,
  Globe2,
  GraduationCap,
  HelpCircle,
  Layers3,
  Leaf,
  LockKeyhole,
  MapPin,
  Menu,
  PackageCheck,
  Play,
  Plus,
  RotateCcw,
  Scale,
  ShieldCheck,
  Sprout,
  Target,
  Timer,
  TrendingUp,
  Truck,
  Wallet,
  Wheat,
  X,
  TriangleAlert,
  Award,
} from "lucide-react";
import { useGame } from "./store/gameStore";
import { events, markets, upgrades } from "./data/gameConfig";
import { knowledge } from "./data/marxKnowledge";
import {
  lockedReason,
  preview,
  purchase,
  scenarios,
  score,
} from "./engine/simulation";
import type { GameState, MarketId, QuarterResult, Upgrade } from "./types/game";
import { money } from "./utils/currency";
import { Landscape } from "./components/Landscape";
import { FinanceChart, ComparisonChart } from "./components/DeferredCharts";
import { Advisor } from "./components/Advisor";
import {
  DecisionFeedback,
  EducationalReport,
} from "./components/world/ChapterMission";
import { GameWorld, ResourceHud } from "./components/world/GameWorld";
const nav = [
  { path: "", label: "Khu doanh nghiệp", icon: MapPin },
  { path: "investments", label: "Đầu tư", icon: Layers3 },
  { path: "production", label: "Sản xuất", icon: Factory },
  { path: "markets", label: "Thị trường", icon: Globe2 },
  { path: "advisor", label: "Cố vấn AI", icon: Bot },
  { path: "knowledge", label: "Kiến thức Mác", icon: BookOpen },
  { path: "report", label: "Báo cáo", icon: TrendingUp },
];
const upgradeIcons = [
  Factory,
  PackageCheck,
  GraduationCap,
  Truck,
  ShieldCheck,
  Sprout,
];
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") close.current();
      if (e.key === "Tab") {
        const focusable = dialog.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]',
        );
        if (!focusable?.length) return;
        const first = focusable[0],
          last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", fn);
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = previousOverflow;
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="modal"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button autoFocus className="close" aria-label="Đóng" onClick={onClose}>
          <X size={20} />
        </button>
        <h2>{title}</h2>
        {children}
      </motion.div>
    </div>
  );
}
function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark">
        <Wheat size={28} />
      </span>
      <div>
        MEKONG<span>BUSINESS SIMULATOR</span>
      </div>
    </div>
  );
}
function Welcome() {
  const { game, start, reset } = useGame();
  const [player, setPlayer] = useState("");
  const [company, setCompany] = useState("Mekong Rice Co.");
  const [help, setHelp] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="welcome">
      <header>
        <Brand />
        <span className="welcome-tag">
          <span className="status-dot" /> Học kinh tế qua trải nghiệm
        </span>
      </header>
      <main className="welcome-main">
        <div className="welcome-copy">
          <span className="eyebrow gold">TỪ ĐỒNG BẰNG · VƯƠN RA THẾ GIỚI</span>
          <h1>
            Một hạt gạo.
            <br />
            Một tầm nhìn.
            <br />
            <em>Vạn cơ hội.</em>
          </h1>
          <p>
            Hành trình hội nhập kinh tế quốc tế của doanh nghiệp Đồng bằng sông
            Cửu Long.
          </p>
          <p className="welcome-description">
            Trở thành giám đốc một doanh nghiệp lúa gạo tại Cần Thơ. Đầu tư,
            điều hành và khám phá sức mạnh của tích lũy tư bản qua 4 chương kinh
            doanh.
          </p>
          <div className="welcome-facts">
            <span>
              <Timer size={17} /> 3–5 phút trải nghiệm
            </span>
            <span>
              <Target size={17} /> 4 chương để trưởng thành
            </span>
          </div>
          <form
            className="start-form"
            onSubmit={(e) => {
              e.preventDefault();
              start(player, company);
              navigate("/game");
            }}
          >
            <label>
              Tên của bạn
              <input
                required
                maxLength={50}
                placeholder="Nhập tên giám đốc"
                value={player}
                onChange={(e) => setPlayer(e.target.value)}
              />
            </label>
            <label>
              Tên doanh nghiệp
              <input
                required
                maxLength={70}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </label>
            <button
              className="primary"
              disabled={!player.trim() || !company.trim()}
            >
              Bắt đầu hành trình <ArrowRight size={18} />
            </button>
            <button
              type="button"
              className="welcome-help"
              onClick={() => setHelp(true)}
            >
              <HelpCircle size={17} /> Cách chơi
            </button>
          </form>
          {game.started && (
            <div className="saved-game">
              <button onClick={() => navigate("/game")}>
                Tiếp tục hành trình đã lưu <ArrowRight size={15} />
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Xóa tiến trình đã lưu?")) reset();
                }}
              >
                Xóa bản lưu
              </button>
            </div>
          )}
        </div>
        <div className="welcome-art">
          <Landscape />
          <div className="map-label">
            <MapPin size={17} />
            <div>
              Cần Thơ, Việt Nam<span>Trái tim của vùng đất chín rồng</span>
            </div>
          </div>
          <div className="welcome-stat">
            <Wheat size={28} />
            <span>
              KHỞI NGHIỆP VỚI
              <strong>
                1.000 <small>triệu đồng vốn</small>
              </strong>
            </span>
          </div>
          <div className="landscape-caption">
            Nơi những quyết định hôm nay
            <br />
            ươm mầm giá trị ngày mai.
          </div>
        </div>
      </main>
      <footer>
        <span>MÔ PHỎNG GIÁO DỤC · TOÀN BỘ SỐ LIỆU LÀ GIẢ ĐỊNH</span>
        <span>Tiếp cận từ lý luận tái sản xuất tư bản của C. Mác</span>
      </footer>
      {help && (
        <Modal
          title="4 chương. Những quyết định của bạn."
          onClose={() => setHelp(false)}
        >
          <ol className="help-list">
            <li>Xem sự kiện và số dư đầu quý.</li>
            <li>Đầu tư có chọn lọc; giữ vốn cho nguyên liệu và lương.</li>
            <li>Chọn thị trường phù hợp chất lượng và truy xuất.</li>
            <li>Xem dự toán, xác nhận sản xuất, đọc kết quả và cố vấn.</li>
            <li>Sau 4 chương, xem bài học và năng lực cạnh tranh.</li>
          </ol>
          <p className="notice">
            Mọi tham số là giả định giáo dục. Lợi nhuận kế toán và giá trị thặng
            dư là hai khái niệm riêng.
          </p>
          <button className="primary" onClick={() => setHelp(false)}>
            Đã hiểu <Check size={17} />
          </button>
        </Modal>
      )}
    </div>
  );
}
function Shell() {
  const { game, reset } = useGame();
  const [mobile, setMobile] = useState(false);
  const [restart, setRestart] = useState(false);
  const [narrow, setNarrow] = useState(
    () => window.matchMedia("(max-width: 760px)").matches,
  );
  const navigate = useNavigate();
  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () => {
      setNarrow(media.matches);
      if (!media.matches) setMobile(false);
    };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!mobile || !narrow) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobile(false);
    };
    window.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", escape);
    };
  }, [mobile, narrow]);
  if (!game.started) return <Navigate to="/" replace />;
  const q = Math.min(game.quarter, 4);
  return (
    <div className="app-shell strategy-shell">
      <DecisionFeedback />
      <aside
        className={`sidebar ${mobile ? "open" : ""}`}
        inert={narrow && !mobile}
      >
        {mobile && narrow && (
          <button
            className="sidebar-close"
            autoFocus
            aria-label="Đóng điều hướng"
            onClick={() => setMobile(false)}
          >
            <X size={18} />
          </button>
        )}
        <Brand />
        <div className="sidebar-label">KHÔNG GIAN ĐIỀU HÀNH</div>
        <nav>
          {nav.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={`/game${path ? "/" + path : ""}`}
              end={!path}
              title={label}
              aria-label={label}
              onClick={() => setMobile(false)}
            >
              <Icon size={19} />
              {label}
              {path === "advisor" && <span className="nav-ai">AI</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="learning-card">
            <Sprout size={25} />
            <strong>Kinh doanh để thấu hiểu</strong>
            <p>Mỗi quyết định là một bài học về kinh tế chính trị.</p>
            <NavLink to="/game/knowledge">
              Khám phá kiến thức <ArrowUpRight size={14} />
            </NavLink>
          </div>
          <div className="profile">
            <span>{game.playerName.charAt(0).toUpperCase()}</span>
            <div>
              <strong>{game.playerName}</strong>
              <small>Giám đốc điều hành</small>
            </div>
            <ShieldCheck size={17} />
          </div>
        </div>
      </aside>
      {mobile && narrow && (
        <button
          className="sidebar-backdrop"
          aria-label="Đóng menu điều hướng"
          onClick={() => setMobile(false)}
        />
      )}
      <div className="workspace" inert={narrow && mobile}>
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            onClick={() => setMobile(!mobile)}
            aria-label="Mở điều hướng"
          >
            <Menu size={22} />
          </button>
          <NavLink className="hud-company" to="/game">
            <span>
              <Wheat size={22} />
            </span>
            <div>
              <strong>MEKONG</strong>
              <small>HÀNH TRÌNH HỘI NHẬP</small>
            </div>
          </NavLink>
          <ResourceHud />
          <div className="topbar-right">
            <span className="quarter-badge">
              <span className="status-dot" />
              {game.quarter > 4 ? "Hoàn thành" : "Chương " + q + " / 4"}
            </span>
            <button
              className="icon-button restart"
              title="Bắt đầu lại"
              aria-label="Bắt đầu lại"
              onClick={() => setRestart(true)}
            >
              <RotateCcw size={17} />
            </button>
          </div>
        </header>
        <div className="page-content strategy-content">
          <Routes>
            <Route index element={<GameWorld />} />
            <Route path="investments" element={<InvestmentPage />} />
            <Route path="production" element={<ProductionPage />} />
            <Route path="markets" element={<MarketPage />} />
            <Route
              path="advisor"
              element={
                <>
                  <PageHeading
                    eyebrow="GÓC NHÌN CHUYÊN GIA"
                    title="Mỗi quyết định, một góc nhìn."
                    description="Hiểu kết quả kinh doanh và kết nối với lý luận kinh tế chính trị."
                  />
                  <Advisor />
                </>
              }
            />
            <Route path="knowledge" element={<KnowledgePage />} />
            <Route path="report" element={<ReportPage />} />
            <Route path="*" element={<Navigate to="/game" replace />} />
          </Routes>
          <footer className="app-footer">
            <span>
              <Leaf size={13} /> Mekong Business Simulator
            </span>
            <span>
              Mô phỏng giáo dục · Số liệu giả định · Đơn vị: triệu đồng
            </span>
          </footer>
        </div>
      </div>
      {restart && (
        <Modal
          title="Bắt đầu một hành trình mới?"
          onClose={() => setRestart(false)}
        >
          <p>Tiến trình hiện tại sẽ được xóa khỏi thiết bị này.</p>
          <div className="button-row">
            <button className="secondary" onClick={() => setRestart(false)}>
              Tiếp tục chơi
            </button>
            <button
              className="primary"
              onClick={() => {
                reset();
                navigate("/");
              }}
            >
              Bắt đầu lại <RotateCcw size={16} />
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
function InvestmentPage() {
  const { game, buy } = useGame();
  const [selected, setSelected] = useState<Upgrade | null>(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const done = game.quarter > 4;
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(t);
  }, [toast]);
  return (
    <>
      <PageHeading
        eyebrow="ĐẦU TƯ CHO TƯƠNG LAI"
        title="Vốn hôm nay. Lợi thế ngày mai."
        description="Chọn khoản đầu tư phù hợp — và giữ đủ tiền để vận hành doanh nghiệp."
        action={
          <div className="cash-chip">
            <Wallet size={18} />
            <strong>{money(game.cash)}</strong> tr.đ khả dụng
          </div>
        }
      />
      <div className="notice">
        <BookOpen size={19} />
        <span>
          <strong>Mở rộng cần đi cùng cân đối vốn.</strong> Thiết bị ghi nhận là
          tài sản; đào tạo, logistics và liên kết là chi phí dịch vụ trong quý
          mua. Mỗi nâng cấp chỉ được mua một lần.
        </span>
      </div>
      <div className="investment-grid">
        {upgrades.map((u, i) => {
          const purchased = game.upgrades.includes(u.id),
            affordable = game.cash >= u.cost,
            Icon = upgradeIcons[i];
          return (
            <motion.article
              className={`panel investment-card ${purchased ? "purchased" : ""}`}
              key={u.id}
              whileHover={{ y: -3 }}
            >
              <div className={`investment-art art-${i}`}>
                <Icon size={53} strokeWidth={1.25} />
                <span className="art-orbit" />
                <span className="investment-category">
                  {u.category === "capex"
                    ? "ĐẦU TƯ TÀI SẢN"
                    : "CHI PHÍ DỊCH VỤ"}
                </span>
                {purchased && (
                  <span className="purchased-badge">
                    <CheckCircle2 size={14} /> Đã đầu tư
                  </span>
                )}
              </div>
              <div className="investment-body">
                <h3>{u.name}</h3>
                <div className="investment-price">
                  {u.cost} <span>triệu đồng</span>
                </div>
                <p className="effect">
                  <Plus size={16} />
                  {u.effect}
                </p>
                <p className="theory">
                  <BookOpen size={14} />
                  {u.theory}
                </p>
                <button
                  className={purchased ? "secondary" : "primary"}
                  disabled={purchased || !affordable || done}
                  onClick={() => {
                    setSelected(u);
                    setError("");
                  }}
                >
                  {purchased ? (
                    <>
                      <Check size={16} /> Đã kích hoạt
                    </>
                  ) : done ? (
                    "Đã kết thúc"
                  ) : !affordable ? (
                    "Không đủ tiền mặt"
                  ) : (
                    <>
                      Xem & đầu tư <ArrowUpRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </motion.article>
          );
        })}
      </div>
      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <div className="modal-price">
            {selected.cost}
            <span> triệu đồng</span>
          </div>
          <p>{selected.effect}</p>
          <p className="notice">{selected.theory}</p>
          <div className="ledger">
            <div>
              <span>Tiền mặt hiện có</span>
              <strong>{money(game.cash)}</strong>
            </div>
            <div>
              <span>Tiền mặt sau đầu tư</span>
              <strong>{money(game.cash - selected.cost)}</strong>
            </div>
            <div>
              <span>Phân loại</span>
              <strong>
                {selected.category === "capex"
                  ? "Tài sản cố định"
                  : "Chi phí quý này"}
              </strong>
            </div>
          </div>
          <InvestmentPreview game={game} upgrade={selected} />
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button
            className="primary full"
            onClick={() => {
              try {
                const lockedBefore = lockedReason(game, "rcep");
                buy(selected.id);
                const updated = useGame.getState().game;
                setToast(
                  `Đã đầu tư: ${selected.name}.${lockedBefore && !lockedReason(updated, "rcep") ? " Thị trường RCEP đã mở!" : ""}${!lockedReason(updated, "eu") && lockedReason(game, "eu") ? " Thị trường EU đã mở!" : ""}`,
                );
                setSelected(null);
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            Xác nhận đầu tư <Check size={17} />
          </button>
        </Modal>
      )}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            className="toast"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <CheckCircle2 size={20} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="bottom-action">
        <span>
          <ShieldCheck size={16} /> Nâng cấp có hiệu lực ngay và duy trì các quý
          tiếp theo
        </span>
        <NavLink className="primary" to="/game/markets">
          Chọn thị trường <ArrowRight size={16} />
        </NavLink>
      </div>
    </>
  );
}
function InvestmentPreview({
  game,
  upgrade,
}: {
  game: GameState;
  upgrade: Upgrade;
}) {
  try {
    const p = preview(purchase(game, upgrade.id));
    return (
      <p className={`notice ${p.warnings.length ? "warning" : ""}`}>
        Dự kiến sau mua: {p.quantity} tấn sản xuất; tiền cuối quý{" "}
        {money(p.endingCash)} triệu. {p.warnings.join(" ")}
      </p>
    );
  } catch (e) {
    return <p className="notice warning">{(e as Error).message}</p>;
  }
}
function MarketPage() {
  const { game, selectMarket } = useGame();
  return (
    <>
      <PageHeading
        eyebrow="CƠ HỘI HỘI NHẬP"
        title="Từ đồng bằng đến thế giới."
        description="Mỗi thị trường là một cơ hội — cùng những điều kiện cần chuẩn bị."
      />
      <div className="notice">
        <Globe2 size={20} />
        <span>
          Giá, nhu cầu, chất lượng và chi phí là{" "}
          <strong>tham số minh họa trong trò chơi</strong>, không phải điều kiện
          pháp lý thực tế của EVFTA/RCEP.
        </span>
      </div>
      <div className="market-grid">
        {(Object.keys(markets) as MarketId[]).map((id, i) => {
          const m = markets[id],
            reason = lockedReason(game, id),
            selected = game.market === id;
          return (
            <article
              key={id}
              className={`panel market-card ${selected ? "selected" : ""}`}
            >
              <div className={`market-art market-art-${i}`}>
                <Globe2 size={78} strokeWidth={0.8} />
                <span>{["VN", "RCEP", "EU"][i]}</span>
              </div>
              <div className="market-body">
                <span className={`pill ${reason ? "muted" : ""}`}>
                  {reason ? (
                    <>
                      <LockKeyhole size={12} /> Chưa đủ điều kiện
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={12} /> Sẵn sàng tiếp cận
                    </>
                  )}
                </span>
                <h2>{m.name}</h2>
                <p>{m.description}</p>
                <div className="market-price">
                  {m.price}
                  <span>triệu đồng / tấn</span>
                </div>
                <div className="ledger">
                  <div>
                    <span>Nhu cầu cơ sở</span>
                    <strong>{m.demand} tấn/quý</strong>
                  </div>
                  <div>
                    <span>Chất lượng tối thiểu</span>
                    <strong>
                      {m.quality ? `${m.quality}/100` : "Không yêu cầu"}
                    </strong>
                  </div>
                  <div>
                    <span>Tuân thủ cố định</span>
                    <strong>{m.compliance} tr.đ/quý</strong>
                  </div>
                  <div>
                    <span>Chi phí thêm / tấn</span>
                    <strong>{money(m.perTon)} tr.đ</strong>
                  </div>
                </div>
                {reason && (
                  <div className="market-lock">
                    <LockKeyhole size={15} />
                    <div>
                      {reason}
                      <small>Gợi ý: máy tách màu, đào tạo và truy xuất.</small>
                    </div>
                  </div>
                )}
                <button
                  className={selected ? "secondary" : "primary"}
                  disabled={!!reason || game.quarter > 4}
                  onClick={() => selectMarket(id)}
                >
                  {selected ? (
                    <>
                      <Check size={16} /> Thị trường đã chọn
                    </>
                  ) : reason ? (
                    "Cần nâng cấp trước"
                  ) : (
                    <>
                      Chọn thị trường <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>
      <div className="bottom-action">
        <NavLink className="text-button" to="/game">
          <ArrowLeft size={16} /> Trở về khu doanh nghiệp
        </NavLink>
        <NavLink className="primary" to="/game/production">
          Dự toán sản xuất <ArrowRight size={16} />
        </NavLink>
      </div>
    </>
  );
}
function ProductionPage() {
  const game = useGame((s) => s.game);
  const navigate = useNavigate();
  let result: QuarterResult | undefined;
  let blocked = "";
  try {
    result = preview(game);
  } catch (e) {
    blocked = (e as Error).message;
  }
  return (
    <>
      <PageHeading
        eyebrow="KẾ HOẠCH CHO MÙA GẶT MỚI"
        title="Từ nhà máy đến thị trường."
        description="Đối chiếu đơn hàng, vốn vận hành và chi phí trước khi chốt quý."
      />
      {game.quarter > 4 ? (
        <div className="panel empty-state">
          <Award size={45} />
          <h2>Đã hoàn thành 4 chương kinh tế</h2>
          <NavLink className="primary" to="/game/report">
            Khám phá thành tích <ArrowRight size={16} />
          </NavLink>
        </div>
      ) : (
        <>
          <div className="production-grid">
            <div className="panel">
              <div className="panel-heading">
                <h3>Kế hoạch quý {game.quarter}</h3>
                <span className="pill">{markets[game.market].name}</span>
              </div>
              <div className="production-quantity">
                <Factory size={40} />
                <div>
                  <strong>
                    {result?.quantity ?? 0}
                    <small> / {game.capacity} tấn</small>
                  </strong>
                  <span>Sản lượng đủ vốn theo đơn hàng</span>
                </div>
              </div>
              <div className="progress-track">
                <span
                  style={{
                    width: `${((result?.quantity ?? 0) / game.capacity) * 100}%`,
                  }}
                />
              </div>
              <p className="subtle">
                Q = nhỏ nhất của công suất, nhu cầu và sản lượng đủ vốn. Toàn bộ
                sản phẩm được bán hết trong quý.
              </p>
              <div className="ledger">
                <div>
                  <span>Tiền mặt sau đầu tư</span>
                  <strong>{money(game.cash)} tr.đ</strong>
                </div>
                <div>
                  <span>Chất lượng</span>
                  <strong>{game.quality}/100</strong>
                </div>
                <div>
                  <span>Sự kiện quý này</span>
                  <strong>{events[game.quarter - 1].name}</strong>
                </div>
              </div>
              <NavLink className="text-button" to="/game/markets">
                Điều chỉnh thị trường <ArrowUpRight size={15} />
              </NavLink>
              {result?.warnings.map((w) => (
                <p className="notice warning" key={w}>
                  <TriangleAlert size={18} />
                  {w}
                </p>
              ))}
              <NavLink className="game-secondary" to="/game">
                <MapPin size={16} /> Trở về khu doanh nghiệp
              </NavLink>
            </div>
            <div className="panel">
              <div className="panel-heading">
                <h3>Dự toán tài chính</h3>
                <span className="subtle">Triệu đồng · giả định</span>
              </div>
              {result ? (
                <>
                  <FinancialLedger result={result} />
                  <button
                    className="game-primary full"
                    onClick={() => navigate("/game?operate=1")}
                  >
                    <Play size={17} /> Hoàn tất chương
                  </button>
                </>
              ) : (
                <>
                  <p className="notice warning">{blocked}</p>
                  <NavLink className="game-secondary" to="/game/markets">
                    Cân đối lại thị trường <Globe2 size={16} />
                  </NavLink>
                </>
              )}
              <p className="fine-print">
                Khấu hao giảm lợi nhuận, không giảm tiền mặt. Đầu tư đã trả
                không bị trừ lại. Không mô phỏng thuế, vay nợ, tồn kho hay công
                nợ.
              </p>
            </div>
          </div>
          <div className="notice">
            <BookOpen size={20} />
            <span>
              Chi phí đào tạo và dịch vụ đầu tư được ghi nhận trong quý mua. Chi
              tài sản cố định được phân bổ qua khấu hao. Lợi nhuận kế toán không
              đồng nhất với giá trị thặng dư.
            </span>
          </div>
        </>
      )}
    </>
  );
}
function FinancialLedger({ result: r }: { result: QuarterResult }) {
  return (
    <div className="ledger financial-ledger">
      <div>
        <span>Doanh thu ({r.quantity} tấn)</span>
        <strong className="positive">+{money(r.revenue)}</strong>
      </div>
      <div>
        <span>Nguyên liệu, chế biến, logistics</span>
        <strong>−{money(r.variableCost)}</strong>
      </div>
      <div>
        <span>Tiền lương quý</span>
        <strong>−{money(r.wages)}</strong>
      </div>
      <div>
        <span>Chi cố định & tuân thủ</span>
        <strong>−{money(r.fixedExpenses)}</strong>
      </div>
      <div>
        <span>Khấu hao (không chi tiền)</span>
        <strong>−{money(r.depreciation)}</strong>
      </div>
      <div>
        <span>Chi đào tạo/dịch vụ đầu tư đã trả</span>
        <strong>−{money(r.investmentExpenses)}</strong>
      </div>
      <div className="ledger-total">
        <span>Lợi nhuận kế toán trước thuế</span>
        <strong className={r.profit < 0 ? "negative" : "positive"}>
          {money(r.profit)}
        </strong>
      </div>
      <div>
        <span>Đầu tư đã trả trong quý (tất cả)</span>
        <strong>{money(r.investments)}</strong>
      </div>
      <div className="ledger-total">
        <span>Tiền mặt cuối quý</span>
        <strong>{money(r.endingCash)}</strong>
      </div>
    </div>
  );
}
function KnowledgePage() {
  return (
    <>
      <PageHeading
        eyebrow="TỪ LÝ LUẬN ĐẾN THỰC TIỄN"
        title="Hiểu sâu hơn. Quyết định tốt hơn."
        description="Kết nối hành trình doanh nghiệp với lý luận tái sản xuất tư bản của C. Mác."
      />
      <div className="knowledge-feature">
        <div>
          <Scale size={30} />
          <span className="eyebrow gold">VÍ DỤ LÝ LUẬN RIÊNG · GIẢ ĐỊNH</span>
          <h2>Giá trị không chỉ là một con số.</h2>
          <p>c = 600 · v = 200 · m = 100 triệu đồng</p>
          <strong>
            W = 900 <span>·</span> c/v = 3 <span>·</span> m′ = 50%
          </strong>
          <small>
            Không suy ra các giá trị lý luận này từ doanh thu và lợi nhuận trong
            game.
          </small>
        </div>
        <BookOpen size={130} strokeWidth={0.65} />
      </div>
      <div className="knowledge-grid">
        {knowledge.map((k, i) => (
          <article key={k.title} className="panel knowledge-card">
            <span className="knowledge-number">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3>{k.title}</h3>
            <div className="formula">{k.formula}</div>
            <p>{k.text}</p>
          </article>
        ))}
      </div>
    </>
  );
}
const metricOptions: {
  key: keyof QuarterResult;
  label: string;
  unit: string;
}[] = [
  { key: "revenue", label: "Doanh thu", unit: "triệu đồng" },
  { key: "profit", label: "Lợi nhuận kế toán", unit: "triệu đồng" },
  { key: "endingCash", label: "Tiền mặt", unit: "triệu đồng" },
  { key: "capacity", label: "Công suất", unit: "tấn/quý" },
  { key: "quality", label: "Chất lượng", unit: "điểm /100" },
  { key: "turnoverFrequency", label: "Tần suất chu chuyển", unit: "vòng/năm" },
];
const comparison = scenarios();
function ReportPage() {
  const game = useGame((s) => s.game),
    sc = score(game);
  const [tab, setTab] = useState<"own" | "compare">(
    game.quarter > 4 ? "own" : "compare",
  );
  const [metric, setMetric] = useState(metricOptions[0]);
  return (
    <>
      <PageHeading
        eyebrow="NHÌN LẠI ĐỂ VƯƠN XA"
        title={
          game.quarter > 4
            ? "Một hành trình. Nhiều giá trị."
            : "Những con đường phát triển."
        }
        description="Kết quả từ bộ máy mô phỏng xác định — cùng điểm khởi đầu, cùng sự kiện kinh tế."
      />
      <div className="tabs">
        <button
          className={tab === "own" ? "active" : ""}
          onClick={() => setTab("own")}
        >
          Báo cáo của bạn {game.quarter <= 4 && <span>đang chơi</span>}
        </button>
        <button
          className={tab === "compare" ? "active" : ""}
          onClick={() => setTab("compare")}
        >
          So sánh hai chiến lược
        </button>
      </div>
      {tab === "own" ? (
        <>
          <EducationalReport game={game} />
          <div className="report-score panel">
            <div className="score-circle">
              <strong>{sc.total}</strong>
              <span>/100 điểm</span>
            </div>
            <div>
              <span className="eyebrow">
                {game.quarter > 4
                  ? "ĐIỂM THAM KHẢO · KHÔNG QUYẾT ĐỊNH CHIẾN THẮNG"
                  : "ĐIỂM THAM KHẢO"}
              </span>
              <h2>{sc.grade}</h2>
              <p>
                {game.companyName} · Hoàn thành {game.history.length}/4 chương ·{" "}
                {game.upgrades.length}/6 nâng cấp
              </p>
              <div className="achievement-row">
                {game.upgrades.includes("training") && (
                  <span className="pill">
                    <GraduationCap size={14} /> Phát triển con người
                  </span>
                )}
                {game.history.some(
                  (r) => r.market === "eu" && r.quantity > 0,
                ) && (
                  <span className="pill gold-pill">
                    <Globe2 size={14} /> Vươn tới EU
                  </span>
                )}
                {game.upgrades.includes("dryer") && (
                  <span className="pill">
                    <Factory size={14} /> Đổi mới sản xuất
                  </span>
                )}
              </div>
            </div>
            <Award size={55} strokeWidth={1} />
          </div>
          <div className="report-grid">
            <section className="panel">
              <h3>Điều gì tạo nên điểm số?</h3>
              {sc.categories.map((c) => (
                <div className="score-category" key={c.name}>
                  <div>
                    <strong>{c.name}</strong>
                    <span>
                      {c.value}/{c.max}
                    </span>
                  </div>
                  <div className="progress-track">
                    <span style={{ width: `${(c.value / c.max) * 100}%` }} />
                  </div>
                  <small>{c.rule}</small>
                </div>
              ))}
            </section>
            <section className="panel">
              <h3>Tăng trưởng qua từng quý</h3>
              <FinanceChart history={game.history} />
              <div className="report-totals">
                <div>
                  <span>Lợi nhuận lũy kế</span>
                  <strong>
                    {money(game.history.reduce((s, x) => s + x.profit, 0))} tr.đ
                  </strong>
                </div>
                <div>
                  <span>Đã đầu tư</span>
                  <strong>
                    {game.purchases.reduce((s, x) => s + x.cost, 0)} tr.đ
                  </strong>
                </div>
              </div>
            </section>
          </div>
          {game.history.length > 0 ? (
            <section className="panel">
              <h3>Sổ kết quả kinh doanh · triệu đồng</h3>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Quý</th>
                      <th>Thị trường</th>
                      <th>Sản lượng</th>
                      <th>Doanh thu</th>
                      <th>Lợi nhuận</th>
                      <th>Tiền cuối quý</th>
                    </tr>
                  </thead>
                  <tbody>
                    {game.history.map((r) => (
                      <tr key={r.quarter}>
                        <td>Quý {r.quarter}</td>
                        <td>{markets[r.market].name}</td>
                        <td>{r.quantity} tấn</td>
                        <td>{money(r.revenue)}</td>
                        <td className={r.profit < 0 ? "negative" : "positive"}>
                          {money(r.profit)}
                        </td>
                        <td>{money(r.endingCash)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : (
            <p className="notice">
              Chưa có kết quả sản xuất. Hãy hoàn thành quý đầu tiên để xem báo
              cáo.
            </p>
          )}
          <div className="advisor-strip">
            <Bot size={27} />
            <div>
              <strong>Từ kết quả đến bài học</strong>
              <p>
                Cùng cố vấn diễn giải quyết định, rủi ro và liên hệ lý luận.
              </p>
            </div>
            <NavLink className="secondary" to="/game/advisor">
              Phân tích tổng kết <ArrowRight size={15} />
            </NavLink>
          </div>
        </>
      ) : (
        <>
          <div className="scenario-cards">
            {[
              {
                s: comparison.a,
                title: "A · Không tái đầu tư",
                text: "Giữ dây chuyền ban đầu, bán nội địa qua cả bốn quý.",
                style: "scenario-a",
              },
              {
                s: comparison.b,
                title: "B · Đầu tư chiến lược",
                text: "Q1: đào tạo, truy xuất. Q2: máy sấy, tách màu. Q3: logistics, hợp tác xã.",
                style: "scenario-b",
              },
            ].map(({ s, title, text, style }) => (
              <article className={`panel ${style}`} key={title}>
                <span className="eyebrow">KỊCH BẢN XÁC ĐỊNH</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <div className="scenario-numbers">
                  <div>
                    <span>Tiền cuối hành trình</span>
                    <strong>
                      {money(s.cash)} <small>tr.đ</small>
                    </strong>
                  </div>
                  <div>
                    <span>Điểm số</span>
                    <strong>
                      {score(s).total}
                      <small>/100</small>
                    </strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h3>Hai lựa chọn, hai quỹ đạo</h3>
                <span>
                  {metric.unit} · kết quả được tính từ cùng điều kiện ban đầu
                </span>
              </div>
            </div>
            <div className="metric-tabs">
              {metricOptions.map((m) => (
                <button
                  key={m.key}
                  className={metric.key === m.key ? "active" : ""}
                  onClick={() => setMetric(m)}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <ComparisonChart
              a={comparison.a.history}
              b={comparison.b.history}
              metric={metric.key}
            />
          </section>
          <section className="panel market-history">
            <h3>Hành trình thị trường</h3>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Chiến lược</th>
                    {events.map((_, i) => (
                      <th key={i}>Quý {i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[comparison.a, comparison.b].map((s, i) => (
                    <tr key={i}>
                      <td>
                        {i ? "B · Đầu tư chiến lược" : "A · Không tái đầu tư"}
                      </td>
                      {s.history.map((r) => (
                        <td key={r.quarter}>{markets[r.market].name}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <div className="learning-insight">
            <BookOpen size={28} />
            <div>
              <h3>Bài học dưới góc nhìn tái sản xuất và tích lũy tư bản</h3>
              <p>
                Đầu tư nâng công suất và chất lượng, đồng thời rút bớt vốn lưu
                động trong ngắn hạn. Kịch bản B có thể sản xuất ít hơn hoặc có
                lợi nhuận thấp hơn ở quý đầu tư. Kết quả so sánh được tính bằng
                quy tắc mô phỏng, không mặc định chiến lược nào luôn thắng.
              </p>
              <p>
                Giữ quy mô minh họa một khía cạnh tái sản xuất giản đơn; game
                không mô phỏng việc tiêu dùng toàn bộ giá trị thặng dư. Mua máy
                bằng vốn ban đầu là đầu tư, không tự động là tích lũy từ giá trị
                thặng dư. Các chỉ tiêu c, v, m thuộc ví dụ lý luận riêng.
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/game/*" element={<Shell />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
