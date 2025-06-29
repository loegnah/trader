import type { TInterval, TSymbol } from "@/type/trade.type";

export enum DopaminePhase {
  IDLE = "IDLE",
  PHASE_1 = "PHASE_1",
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
}
