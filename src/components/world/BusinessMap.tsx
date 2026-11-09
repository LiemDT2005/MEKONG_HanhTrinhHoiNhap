import { useId, type KeyboardEvent } from "react";
import type { GameState, UpgradeId } from "../../types/game";

export type BuildingId = "fields" | "factory" | "training" | "office" | "port";
export const buildings: Record<
  BuildingId,
  { name: string; subtitle: string; upgrades: UpgradeId[] }
> = {
  fields: {
    name: "Vùng nguyên liệu",
    subtitle: "Liên kết để cùng phát triển",
    upgrades: ["cooperative"],
  },
  factory: {
    name: "Nhà máy chế biến",
    subtitle: "Trái tim của doanh nghiệp",
    upgrades: ["dryer", "sorter"],
  },
  training: {
    name: "Trung tâm nhân sự",
    subtitle: "Đầu tư vào con người",
    upgrades: ["training"],
  },
  office: {
    name: "Văn phòng điều hành",
    subtitle: "Chất lượng tạo nên uy tín",
    upgrades: ["traceability"],
  },
  port: {
    name: "Bến cảng Mekong",
    subtitle: "Cánh cửa ra thị trường",
    upgrades: ["logistics"],
  },
};
function Building({
  x,
  y,
  w = 65,
  d = 32,
  h = 60,
  roof = "#527e72",
  wall = "#f1e6be",
  windows = true,
}: {
  x: number;
  y: number;
  w?: number;
  d?: number;
  h?: number;
  roof?: string;
  wall?: string;
  windows?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse
        cx="4"
        cy="8"
        rx={w * 1.1}
        ry={d * 0.85}
        fill="#30543b"
        opacity=".13"
      />
      <path d={`M${-w} ${-h} 0 ${d - h}V${d}L${-w} 0Z`} fill={wall} />
      <path d={`M0 ${d - h} ${w} ${-h}V0L0 ${d}Z`} fill="#c8cba2" />
      <path
        d={`M${-w - 5} ${-h - 3} 0 ${-d - h - 6} ${w + 5} ${-h - 3} 0 ${d - h}Z`}
        fill={roof}
      />
      <path
        d={`M${-w - 5} ${-h - 3} 0 ${d - h} ${w + 5} ${-h - 3}`}
        stroke="#fff"
        strokeOpacity=".25"
        strokeWidth="3"
      />
      {[0.2, 0.4, 0.6, 0.8].map((t) => (
        <path
          key={t}
          d={`M${-w + w * t} ${-h - d * t - 3} ${w * t} ${d - h - d * t - 1}`}
          stroke="#ffffff"
          strokeOpacity=".16"
          strokeWidth="2"
        />
      ))}
      <g transform={`matrix(1 ${d / w} 0 1 ${-w} ${-h})`}>
        <rect
          x={w * 0.38}
          y={h * 0.36}
          width={w * 0.26}
          height={h * 0.64}
          rx="1"
          fill="#57776a"
        />
        {windows && (
          <>
            <rect
              x={w * 0.1}
              y={h * 0.3}
              width={w * 0.16}
              height={h * 0.22}
              fill="#9fbfc0"
            />
            <rect
              x={w * 0.73}
              y={h * 0.3}
              width={w * 0.16}
              height={h * 0.22}
              fill="#9fbfc0"
            />
          </>
        )}
        <path d={`M0 ${h * 0.85}H${w}`} stroke="#b9b99b" strokeWidth="2" />
      </g>
      <g transform={`matrix(1 ${-d / w} 0 1 0 ${d - h})`}>
        {[0.18, 0.55].map((t) => (
          <g key={t}>
            <rect
              x={w * t}
              y={h * 0.3}
              width={w * 0.23}
              height={h * 0.24}
              fill="#537e77"
            />
            <path
              d={`M${w * (t + 0.115)} ${h * 0.3}V${h * 0.54}`}
              stroke="#b4c4a4"
              strokeWidth="2"
            />
          </g>
        ))}
      </g>
    </g>
  );
}
function Tree({
  x,
  y,
  scale = 1,
  palm = false,
}: {
  x: number;
  y: number;
  scale?: number;
  palm?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cy="5" rx="20" ry="8" fill="#254e3c" opacity=".13" />
      <path d="M0 0 2-39" stroke="#967d49" strokeWidth="6" />
      {palm ? (
        <g fill="#3b7851">
          <path d="M2-39c-45-24-42 3-9 3-35 7-23 25 3 5-8 33 11 25 10 0 21 28 37 11 8-5 36 0 34-24-12-3Z" />
          <path d="M2-39c2-31 29-31 19-12-7 5-12 8-19 12" fill="#56964e" />
        </g>
      ) : (
        <>
          <ellipse cy="-36" rx="20" ry="25" fill="#397a4d" />
          <ellipse cx="-10" cy="-32" rx="15" ry="18" fill="#4d8c50" />
          <ellipse cx="5" cy="-46" rx="13" ry="15" fill="#6ba45c" />
        </>
      )}
    </g>
  );
}
function Silo({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cy="6" rx="22" ry="10" fill="#355b3d" opacity=".15" />
      <path d="M-17-68V0c0 12 34 12 34 0v-68" fill="#d7dbc3" />
      <path d="M0-68H17V0c0 5-8 8-17 9" fill="#aebda7" />
      <ellipse cy="-68" rx="17" ry="9" fill="#edf0d7" />
      <path
        d="M-17-45c0 10 34 10 34 0M-17-21c0 10 34 10 34 0"
        stroke="#a5b99f"
        strokeWidth="2"
      />
      <path d="M-9-65V0m6-61V4" stroke="#819d89" strokeWidth="2" />
    </g>
  );
}
function Worker({
  x,
  y,
  color = "#e3ae58",
}: {
  x: number;
  y: number;
  color?: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cy="3" rx="7" ry="3" fill="#37543c" opacity=".14" />
      <path d="m-2-3-1 7m5-7 1 7" stroke="#466a5d" strokeWidth="3" />
      <path d="M-5-13 0-16l5 3v10H-5" fill={color} />
      <circle cy="-19" r="4" fill="#d8ab79" />
      <path d="m-8-20 8-5 8 5-8 2Z" fill="#f0d894" />
    </g>
  );
}
function Truck({
  x,
  y,
  upgraded = false,
}: {
  x: number;
  y: number;
  upgraded?: boolean;
}) {
  return (
    <g className="map-truck" transform={`translate(${x} ${y})`}>
      <ellipse cx="3" cy="8" rx="34" ry="13" fill="#264e3f" opacity=".15" />
      <path d="m-32-14 21-11 34 17-21 12Z" fill="#e3dfc1" />
      <path
        d="m-32-14 34 18v20l-34-18Z"
        fill={upgraded ? "#ecbd57" : "#cbd2b2"}
      />
      <path d="M2 4 23-8v21L2 24Z" fill={upgraded ? "#b58e3e" : "#9fb39b"} />
      <path d="m23-8 15 8v20l-15-7Z" fill="#517f6c" />
      <path d="m26-4 9 5v8l-9-5Z" fill="#b9d9cf" />
      <ellipse cx="-22" cy="11" rx="5" ry="7" fill="#40564b" />
      <ellipse cx="-2" cy="23" rx="5" ry="7" fill="#40564b" />
      <ellipse cx="30" cy="20" rx="4" ry="6" fill="#40564b" />
    </g>
  );
}
function MapLabel({
  x,
  y,
  name,
  status,
  active,
  gold = false,
}: {
  x: number;
  y: number;
  name: string;
  status: string;
  active: boolean;
  gold?: boolean;
}) {
  return (
    <g
      transform={`translate(${x} ${y})`}
      className={`map-label-svg ${active ? "is-selected" : ""}`}
    >
      <path
        d="M0 0V-18"
        stroke="#547b58"
        strokeOpacity=".5"
        strokeDasharray="3 3"
      />
      <rect
        x="-95"
        y="-69"
        width="190"
        height="52"
        rx="10"
        fill={active ? "#214e3d" : "#fffdf0"}
        stroke={active ? "#e2bf69" : "#d7dfbb"}
        strokeWidth={active ? 2 : 1}
      />
      <circle cx="-79" cy="-48" r="4" fill={gold ? "#c29b41" : "#6c9b65"} />
      <text
        x="-67"
        y="-44"
        fontSize="17"
        fill={active ? "#fbf2cf" : "#355b40"}
        fontWeight="650"
      >
        {name}
      </text>
      <text
        x="0"
        y="-28"
        textAnchor="middle"
        fontSize="11"
        fill={active ? "#bdd0aa" : "#829273"}
      >
        {status}
      </text>
    </g>
  );
}
export function BusinessMap({
  game,
  selected,
  onSelect,
  running = false,
}: {
  game: GameState;
  selected: BuildingId | null;
  onSelect: (id: BuildingId) => void;
  running?: boolean;
}) {
  const id = useId().replaceAll(":", "");
  const has = (u: UpgradeId) => game.upgrades.includes(u),
    quarter = Math.min(game.quarter, 4);
  const areaProps = (building: BuildingId) => ({
    role: "button" as const,
    tabIndex: 0,
    "aria-label": `Khám phá ${buildings[building].name}`,
    "aria-pressed": selected === building,
    onClick: () => onSelect(building),
    onKeyDown: (e: KeyboardEvent<SVGGElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(building);
      }
    },
    className: `map-building ${selected === building ? "selected" : ""}`,
  });
  return (
    <svg
      className={`business-map ${running ? "is-running" : ""} season-${quarter}`}
      viewBox="0 0 1100 650"
      fill="none"
      aria-label="Bản đồ doanh nghiệp bên dòng Mekong, chọn một công trình để điều hành"
    >
      <defs>
        <linearGradient
          id={`${id}-water`}
          x1="850"
          y1="20"
          x2="500"
          y2="660"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9dccb5" />
          <stop offset="1" stopColor="#72b7a3" />
        </linearGradient>
        <pattern
          id={`${id}-paper`}
          width="26"
          height="26"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r=".8" fill="#93a279" opacity=".15" />
        </pattern>
        <filter
          id={`${id}-shadow`}
          x="-40%"
          y="-40%"
          width="180%"
          height="180%"
        >
          <feDropShadow
            dx="0"
            dy="14"
            stdDeviation="14"
            floodColor="#497e5b"
            floodOpacity=".15"
          />
        </filter>
        <pattern
          id={`${id}-field`}
          width="28"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="m10 19 3-13 3 13m-3-5-6-5m6 3 6-7"
            stroke="#e6d388"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </pattern>
      </defs>
      <rect width="1100" height="650" fill="#e9eedb" />
      <rect width="1100" height="650" fill={`url(#${id}-paper)`} />
      <path
        d="M820-35c-135 131 75 176 7 276S658 365 730 479s213 73 212 206h190V-35Z"
        fill={`url(#${id}-water)`}
      />
      <g
        className="river-ripples"
        stroke="#e8f1d7"
        strokeOpacity=".42"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M902 112h35m-11 8h18m-49 102h29m-72 84h38m21 10h17m-17 206h35m18 93h48m-57-183h25M997 345h36" />
      </g>
      <path
        d="m85 291 420-186 473 226-383 273L85 345Z"
        fill="#92ae79"
        filter={`url(#${id}-shadow)`}
      />
      <path d="m85 291 420-186 473 226-383 247Z" fill="#b3c38d" />
      <path d="m85 291 510 287v26L85 345Z" fill="#9caf76" />
      <path d="m595 578 383-247v28L595 604Z" fill="#789f73" />
      <path
        d="m108 289 397-172 449 216-359 231Z"
        stroke="#d0d8a9"
        strokeWidth="2"
      />
      <path
        d="m246 287 255 139 245-140m-245 140 91 63m-91-63 71-186m-71 186-195 73m440-213 74 146"
        stroke="#d7d5b1"
        strokeWidth="30"
        strokeLinejoin="round"
      />
      <path
        d="m246 287 255 139 245-140m-245 140 91 63m-91-63 71-186m-71 186-195 73m440-213 74 146"
        stroke="#eee5bf"
        strokeWidth="22"
        strokeLinejoin="round"
      />
      <path
        d="m252 291 249 135 245-140m-245 140 91 63m-91-63 71-186m-71 186-195 73"
        stroke="#d0c9a5"
        strokeWidth="1.5"
        strokeDasharray="7 12"
      />
      <g {...areaProps("fields")}>
        <path
          className="building-ground"
          d="m124 286 176-83 159 80-165 90Z"
          fill="#91ad62"
          stroke="#d5d99a"
          strokeWidth="4"
        />
        <path d="m137 284 162-72 145 71-150 80Z" fill={`url(#${id}-field)`} />
        <path
          d="m182 259 157 78m-102-101 156 72m-101-94 146 70M164 302l161-75m-113 100 160-77m-107 103 158-81"
          stroke="#6f9858"
          strokeWidth="4"
        />
        {has("cooperative") && (
          <g className="new-construction">
            <Building x={173} y={344} w={35} d={18} h={32} roof="#bba15b" />
            <path d="m181 300 15-7v28l-15 7Z" fill="#ecce78" />
            <text x="168" y="316" fontSize="9" fill="#476c45" fontWeight="700">
              HTX
            </text>
            <g fill="#e2c16e">
              <ellipse cx="238" cy="351" rx="14" ry="7" />
              <rect x="224" y="341" width="28" height="10" />
              <ellipse cx="238" cy="341" rx="14" ry="7" />
            </g>
          </g>
        )}
        <MapLabel
          x={248}
          y={230}
          name="Vùng nguyên liệu"
          status={
            has("cooperative")
              ? "ĐÃ LIÊN KẾT HỢP TÁC XÃ"
              : "NGUỒN LÚA ĐỒNG BẰNG"
          }
          active={selected === "fields"}
        />
      </g>
      {[
        { x: 100, y: 267 },
        { x: 130, y: 250 },
        { x: 362, y: 178 },
        { x: 395, y: 164 },
        { x: 431, y: 151 },
        { x: 694, y: 215 },
        { x: 737, y: 232 },
        { x: 887, y: 359 },
        { x: 925, y: 334 },
        { x: 643, y: 550 },
        { x: 673, y: 532 },
        { x: 226, y: 401 },
        { x: 206, y: 388 },
      ].map((t, i) => (
        <Tree
          key={i}
          {...t}
          scale={i % 3 === 0 ? 1.1 : 0.85}
          palm={i % 2 === 0}
        />
      ))}
      <g {...areaProps("factory")}>
        <path
          className="building-ground"
          d="m377 290 182-91 135 87-179 104Z"
          fill="#c5d0a1"
          stroke="#dce2bd"
          strokeWidth="2"
        />
        <Silo x={405} y={299} />
        <Silo x={440} y={319} />
        <Building
          x={541}
          y={311}
          w={103}
          d={50}
          h={82}
          roof={has("sorter") ? "#3f7974" : "#638776"}
          wall="#f4e7bb"
        />
        <path d="m474 273 48 22v20l-48-23Z" fill="#e4cb81" />
        <text
          x="493"
          y="300"
          transform="rotate(26 493 300)"
          textAnchor="middle"
          fontSize="8"
          fontWeight="700"
          fill="#49654a"
        >
          MEKONG
        </text>
        <path d="m590 187 15-8v49l-15 8Z" fill="#c2c6ae" />
        <path d="m590 187-10-5v48l10 6Z" fill="#e0ddbe" />
        <path d="m580 182 15-8 10 5-15 8Z" fill="#9bac9a" />
        <g className="factory-steam" fill="#f8f6df" opacity=".6">
          <circle cx="592" cy="161" r="8" />
          <circle cx="597" cy="141" r="11" />
          <circle cx="585" cy="117" r="14" />
        </g>
        {has("sorter") && (
          <g className="new-construction">
            <path
              d="m490 216 47-22 48 24-45 24Z"
              fill="#2e5d66"
              stroke="#a2c0ae"
              strokeWidth="2"
            />
            <path
              d="m502 211 45 24m-29-32 45 24m-48-11 46-21m-31 29 46-22"
              stroke="#8eaeaa"
              strokeWidth="1"
            />
            <Building x={638} y={337} w={32} d={16} h={37} roof="#71a7a0" />
            <circle cx="645" cy="330" r="4" fill="#d9c66a" />
          </g>
        )}
        {has("dryer") && (
          <g className="new-construction">
            <Silo x={371} y={325} />
            <path d="m359 254 12-8 13 8-13 8Z" fill="#e7bb5c" />
            <path d="m390 303 39 21" stroke="#b9c5a2" strokeWidth="7" />
          </g>
        )}
        <MapLabel
          x={550}
          y={184}
          name="Nhà máy chế biến"
          status={`${game.capacity} TẤN / QUÝ · ${has("sorter") ? "CÔNG NGHỆ MỚI" : "ĐANG SẴN SÀNG"}`}
          active={selected === "factory"}
          gold={has("dryer") || has("sorter")}
        />
      </g>
      <g {...areaProps("training")}>
        <path
          className="building-ground"
          d="m677 301 95-48 109 55-100 62Z"
          fill="#c7d2a3"
        />
        <Building
          x={779}
          y={308}
          w={62}
          d={30}
          h={49}
          roof={has("training") ? "#d4b262" : "#91a07a"}
        />
        <path d="m771 230 15 8 15-8-15-8Z" fill="#e9d59a" />
        {has("training") && (
          <g className="new-construction">
            <path d="M847 293v-65" stroke="#87966c" strokeWidth="3" />
            <path d="m849 228 26 12-26 5Z" fill="#e2b85d" />
            <Worker x={743} y={350} />
            <Worker x={764} y={362} color="#86a57a" />
          </g>
        )}
        <MapLabel
          x={795}
          y={240}
          name="Trung tâm nhân sự"
          status={has("training") ? "ĐỘI NGŨ ĐÃ ĐÀO TẠO" : "NÂNG TẦM CON NGƯỜI"}
          active={selected === "training"}
          gold={has("training")}
        />
      </g>
      <g {...areaProps("office")}>
        <path
          className="building-ground"
          d="m234 451 116-61 115 62-108 66Z"
          fill="#cbd4ad"
          stroke="#dce2bc"
          strokeWidth="2"
        />
        <Building x={349} y={444} w={64} d={32} h={65} roof="#c4a567" />
        <Building x={412} y={456} w={29} d={15} h={35} roof="#e5d297" />
        <path d="M291 440v-58" stroke="#8f9774" strokeWidth="3" />
        <path d="m293 382 24 12-24 2Z" fill="#d5b456" />
        {has("traceability") && (
          <g className="new-construction">
            <path d="m374 411 14 7v19l-14-7Z" fill="#f4ebcc" />
            <path
              d="m377 416 8 4v10l-8-4Z"
              stroke="#417565"
              strokeWidth="2"
              strokeDasharray="2 2"
            />
            <path d="m423 399 12-6 12 6-12 7Z" fill="#6d9b68" />
            <path d="m430 398 4 4 7-9" stroke="#f5e8b7" strokeWidth="2" />
          </g>
        )}
        <MapLabel
          x={341}
          y={370}
          name="Văn phòng điều hành"
          status={
            has("traceability") ? "ĐÃ CÓ TRUY XUẤT" : "ĐỊNH HƯỚNG & CHẤT LƯỢNG"
          }
          active={selected === "office"}
          gold={has("traceability")}
        />
      </g>
      <g>
        <Building x={585} y={469} w={70} d={34} h={42} roof="#819580" />
        <path d="m538 455 50 25v19l-50-25Z" fill="#b9ad7e" />
        <path d="m546 460 34 17v17l-34-17Z" fill="#73846a" />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${624 + i * 17} ${494 - i * 8})`}>
            <path d="m-9-8 9-5 9 5-9 5Z" fill="#ead59c" />
            <path d="m-9-8 9 5v12l-9-5Z" fill="#d2bb80" />
            <path d="m0-3 9-5V4L0 9Z" fill="#b8ac73" />
          </g>
        ))}
      </g>
      <Truck x={508} y={416} upgraded={has("logistics")} />
      <Worker x={473} y={355} />
      <Worker x={617} y={503} color="#8ca78b" />
      <g {...areaProps("port")}>
        <path
          className="building-ground"
          d="m729 418 86-45 122 61-82 53Z"
          fill="#afba8b"
        />
        <path d="m786 457 55-32 102 51-53 36Z" fill="#b49b67" />
        <path d="m786 457 104 55v10l-104-55Z" fill="#977c50" />
        <path d="m890 512 53-36v11l-53 35Z" fill="#8c7d56" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={`m${799 + i * 19} ${451 + i * 10} 38-22`}
            stroke="#d4ba7e"
            strokeWidth="2"
          />
        ))}
        <Building x={799} y={412} w={44} d={22} h={42} roof="#6c8e7d" />
        <g className="map-boat" transform="translate(937 533)">
          <ellipse cy="20" rx="67" ry="23" fill="#4e9a89" opacity=".2" />
          <path d="m-66-9 81-21 57 34-58 30-65-22Z" fill="#4b7260" />
          <path d="m-66-9 81-21 57 34-58 20-65-19Z" fill="#f0d9a2" />
          <path d="m-35-13 37-11 43 24-37 12Z" fill="#bd9d63" />
          <path d="M5-17v-58" stroke="#8a8e65" strokeWidth="3" />
          <path d="M8-73 44-18 8-28Z" fill="#f6e9bf" />
          {game.market !== "domestic" && (
            <path d="M7-75 28-65 7-62Z" fill="#caac55" />
          )}
        </g>
        {has("logistics") && (
          <g className="new-construction">
            <path d="M869 434v-99l49-24" stroke="#72927a" strokeWidth="6" />
            <path d="m869 347 49-25v48" stroke="#bfc797" strokeWidth="3" />
            <path d="m917 370-5 8h11Z" fill="#e4ba5c" />
            <path d="m862 440 16-8 11 5-16 9Z" fill="#d2b469" />
            <path d="M869 339v-13l49-23v12Z" fill="#d2b469" />
          </g>
        )}
        <MapLabel
          x={853}
          y={394}
          name="Bến cảng Mekong"
          status={
            game.market === "domestic"
              ? "TUYẾN NỘI ĐỊA"
              : game.market === "eu"
                ? "TUYẾN XUẤT KHẨU EU"
                : "TUYẾN XUẤT KHẨU RCEP"
          }
          active={selected === "port"}
          gold={has("logistics")}
        />
      </g>
      <g fill="#789853" opacity=".75">
        {[
          [318, 535],
          [340, 544],
          [367, 558],
          [160, 354],
          [181, 365],
          [703, 488],
          [723, 477],
          [685, 187],
          [665, 176],
        ].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="7" ry="3" />
        ))}
      </g>
      <g transform="translate(1015 98)" opacity=".55">
        <path d="m0-30 9 30-9-6-9 6Z" fill="#4f7962" />
        <path d="m0 30 9-30-9 6-9-6Z" fill="#b8c9a5" />
        <text
          y="-43"
          textAnchor="middle"
          fill="#597961"
          fontSize="13"
          fontWeight="600"
        >
          B
        </text>
      </g>
      <g transform="translate(95 550)" fill="#6e8e6b">
        <text fontSize="10" letterSpacing="3">
          CẦN THƠ · VIỆT NAM
        </text>
        <text y="20" fontSize="10" fill="#91a385">
          10°02′ N · 105°47′ E
        </text>
      </g>
      <text
        x="1008"
        y="434"
        transform="rotate(64 1008 434)"
        fill="#498b7c"
        opacity=".65"
        fontSize="12"
        letterSpacing="5"
      >
        DÒNG MEKONG
      </text>
    </svg>
  );
}
