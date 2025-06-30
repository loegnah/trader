import type { TInterval, TSymbol } from "@/type/trade.type";

export enum DopaminePhase {
  IDLE = "idle",
  OUT_RSI = "out-rsi",
  ORDER = "order",
  PHASE_3 = "PHASE_3",
  PHASE_4 = "PHASE_4",
  PHASE_5 = "PHASE_5",
  PHASE_6 = "PHASE_6",
  PHASE_7 = "PHASE_7",
}

export class DopamineConfig {
  symbol: TSymbol = "BTCUSDT";
  interval: TInterval = "1";
  topic: TSymbol = `kline.${this.interval}.${this.symbol}`;

  leverage = 20;

  rsi_trigger_top = [80, 85, 90, 95];
  rsi_trigger_btm = [20, 15, 10, 5];

  rsi_threshold_top = 90;
  rsi_threshold_btm = 10;

  breakeven_profit = 0.06; // %, 본절시 손실방지용
}
