import type { TInterval, TSymbol } from "@/type/trade.type";

export enum DopaminePhase {
  IDLE = "IDLE",
  OUT_RSI = "outRsi",
  PHASE_2 = "PHASE_2",
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

  rsi_trigger_first_top = 80;
  rsi_trigger_first_btm = 20;
  rsi_trigger_second_top = 85;
  rsi_trigger_second_btm = 15;
  rsi_threshold_top = 90;
  rsi_threshold_btm = 10;

  breakeven_profit = 0.06; // %, 본절시 손실방지용
}
