export type MarketId = "domestic" | "rcep" | "eu";
export type UpgradeId =
  | "dryer"
  | "sorter"
  | "training"
  | "logistics"
  | "traceability"
  | "cooperative";
export interface Purchase {
  id: UpgradeId;
  quarter: number;
  cost: number;
  category: "capex" | "expense";
}
export interface QuarterResult {
  quarter: number;
  market: MarketId;
  openingCash: number;
  investments: number;
  investmentExpenses: number;
  quantity: number;
  revenue: number;
  variableCost: number;
  wages: number;
  fixedExpenses: number;
  depreciation: number;
  operatingProfit: number;
  profit: number;
  endingCash: number;
  capacity: number;
  quality: number;
  turnoverDays: number;
  turnoverFrequency: number;
  equipment: number;
  event: string;
  warnings: string[];
}
export interface GameState {
  playerName: string;
  companyName: string;
  quarter: number;
  cash: number;
  equipment: number;
  capacity: number;
  quality: number;
  turnoverDays: number;
  upgrades: UpgradeId[];
  purchases: Purchase[];
  market: MarketId;
  history: QuarterResult[];
  started: boolean;
  failed: boolean;
}
export interface Upgrade {
  id: UpgradeId;
  name: string;
  cost: number;
  category: "capex" | "expense";
  effect: string;
  theory: string;
  capacity?: number;
  quality?: number;
  days?: number;
  equipment?: number;
}
