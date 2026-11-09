import type { GameState, MarketId, Upgrade } from "../types/game";
export const config = {
  initialCash: 700,
  initialEquipment: 300,
  capacity: 40,
  quality: 50,
  turnoverDays: 60,
  rawMaterial: 13,
  processing: 2,
  logistics: 1.5,
  wages: 80,
  fixed: 30,
  depreciation: 15,
  upgradeDepreciationRate: 0.025,
  dryerSaving: 0.2,
  logisticsSaving: 0.4,
  cooperativeSaving: 0.5,
  quarterDays: 90,
  yearDays: 360,
};
export const initialState = (
  playerName = "",
  companyName = "Mekong Rice Co.",
): GameState => ({
  playerName,
  companyName,
  quarter: 1,
  cash: config.initialCash,
  equipment: config.initialEquipment,
  capacity: config.capacity,
  quality: config.quality,
  turnoverDays: config.turnoverDays,
  decisions: [],
  upgrades: [],
  purchases: [],
  market: "domestic",
  history: [],
  started: !!playerName,
  failed: false,
});
export const upgrades: Upgrade[] = [
  {
    id: "dryer",
    name: "Máy sấy lúa công nghệ cao",
    cost: 120,
    category: "capex",
    capacity: 10,
    equipment: 120,
    effect: "+10 tấn/quý · chi phí chế biến −0,2 triệu/tấn do giảm hao hụt",
    theory: "Tích lũy tư bản và đổi mới tư liệu sản xuất.",
  },
  {
    id: "sorter",
    name: "Máy tách màu tự động",
    cost: 150,
    category: "capex",
    quality: 15,
    equipment: 150,
    effect: "+15 chất lượng · hiện đại hóa chế biến",
    theory:
      "Hiện đại hóa lực lượng sản xuất; không đồng nhất chi máy móc với c/v.",
  },
  {
    id: "training",
    name: "Đào tạo lao động",
    cost: 40,
    category: "expense",
    quality: 5,
    days: 5,
    effect: "+5 chất lượng · chu kỳ −5 ngày",
    theory: "Nâng cao chất lượng sức lao động; ghi nhận chi phí đào tạo.",
  },
  {
    id: "logistics",
    name: "Tối ưu logistics",
    cost: 100,
    category: "expense",
    days: 10,
    effect: "Vận chuyển −0,4 triệu/tấn · chu kỳ −10 ngày",
    theory: "Rút ngắn thời gian lưu thông và chu chuyển tư bản.",
  },
  {
    id: "traceability",
    name: "Hệ thống truy xuất nguồn gốc",
    cost: 60,
    category: "capex",
    quality: 10,
    equipment: 60,
    effect: "+10 chất lượng · đáp ứng điều kiện truy xuất EU",
    theory: "Đầu tư hệ thống sản xuất và năng lực hội nhập.",
  },
  {
    id: "cooperative",
    name: "Liên kết hợp tác xã",
    cost: 50,
    category: "expense",
    effect: "Nguyên liệu −0,5 triệu/tấn · ổn định nguồn cung",
    theory: "Liên kết sản xuất; hợp tác không tự động là tập trung tư bản.",
  },
];
export const markets: Record<
  MarketId,
  {
    name: string;
    price: number;
    demand: number;
    quality: number;
    compliance: number;
    perTon: number;
    description: string;
  }
> = {
  domestic: {
    name: "Nội địa",
    price: 22,
    demand: 55,
    quality: 0,
    compliance: 0,
    perTon: 0,
    description: "Nền tảng vững chắc tại thị trường Việt Nam.",
  },
  rcep: {
    name: "RCEP",
    price: 25,
    demand: 48,
    quality: 60,
    compliance: 12,
    perTon: 0.6,
    description: "Cơ hội tiếp cận chuỗi giá trị khu vực.",
  },
  eu: {
    name: "EU · EVFTA",
    price: 29,
    demand: 45,
    quality: 80,
    compliance: 25,
    perTon: 1.1,
    description: "Thị trường giá trị cao, yêu cầu chất lượng và truy xuất.",
  },
};
export const events = [
  {
    name: "Vòng luẩn quẩn của doanh nghiệp nhỏ",
    description:
      "Doanh nghiệp bước vào thị trường nội địa. Cân đối vốn lưu động trước khi mở rộng sản xuất.",
    priceDelta: 0,
    logisticsDelta: 0,
    delay: 0,
    exportDemandBonus: 0,
    mitigatedLogisticsDelta: 0,
    mitigatedDelay: 0,
  },
  {
    name: "Cuộc đua công nghệ",
    description:
      "Đối thủ nâng cấp dây chuyền. Giá nội địa giảm 0,5 triệu/tấn trong quý này; xuất khẩu giữ nguyên giá.",
    priceDelta: -0.5,
    logisticsDelta: 0,
    delay: 0,
    exportDemandBonus: 0,
    mitigatedLogisticsDelta: 0,
    mitigatedDelay: 0,
  },
  {
    name: "Điểm nghẽn logistics",
    description:
      "Vận chuyển tăng 0,8 triệu/tấn và chu kỳ tăng 15 ngày; nâng cấp logistics giảm tác động còn 0,2 triệu/tấn và 5 ngày.",
    priceDelta: 0,
    logisticsDelta: 0.8,
    delay: 15,
    exportDemandBonus: 0,
    mitigatedLogisticsDelta: 0.2,
    mitigatedDelay: 5,
  },
  {
    name: "Vươn ra thị trường quốc tế",
    description:
      "Nhu cầu xuất khẩu tăng thêm 5 tấn trong quý này. Chất lượng và truy xuất là chìa khóa tiếp cận.",
    priceDelta: 0,
    logisticsDelta: 0,
    delay: 0,
    exportDemandBonus: 5,
    mitigatedLogisticsDelta: 0,
    mitigatedDelay: 0,
  },
];
