import type { DopamineConfig } from "@/bot/dopamine/dpm.config";
import type { Candle, TSide } from "@/type/trade.type";

type CandleData = {
  candle?: Candle;
  side?: TSide;
  ohlc?: number;
  rsi?: number;
};

export class DopamineMemory {
  private readonly conf: DopamineConfig;

  cn: CandleData = {};
  lv: CandleData = {};
  gains?: number[];
  losses?: number[];

  // 각 round 마다 리셋되는 데이터
  round: {
    abc?: string;
  };

  constructor(params: { conf: DopamineConfig }) {
    this.conf = params.conf;
    this.round = {};
  }

  resetRound() {
    this.round = {};
  }
}
