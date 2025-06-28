import type { DopamineConfig } from "@/bot/dopamine/dpm.config";
import type { Candle } from "@/type/trade.type";

export class DopamineMemory {
  private readonly conf: DopamineConfig;

  round: {
    candleCn?: Candle;
    candleLv?: Candle;
  };

  constructor(params: { conf: DopamineConfig }) {
    this.conf = params.conf;
    this.round = {};
  }

  resetRound() {
    this.round = {};
  }
}
