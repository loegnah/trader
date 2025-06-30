import type { DopamineConfig } from "@/bot/dopamine/dpm.config";
import type { MemoryCandleData, TSide } from "@/type/trade.type";

type RoundData = {
  triggerLevel: number;
  pointTop: number;
  pointBtm: number;
  positionSide?: TSide;
};

const defaultRoundData: RoundData = {
  triggerLevel: 0,
  pointTop: -1,
  pointBtm: Number.POSITIVE_INFINITY,
};

export class DopamineMemory {
  private readonly conf: DopamineConfig;

  cn!: MemoryCandleData;
  lv!: MemoryCandleData;
  rsiData: {
    gains: number[];
    losses: number[];
  };

  // 각 round 마다 리셋되는 데이터
  round: RoundData = defaultRoundData;

  constructor(params: { conf: DopamineConfig }) {
    this.conf = params.conf;
    this.rsiData = {
      gains: [],
      losses: [],
    };
  }

  init = (params: {
    lv: MemoryCandleData;
    cn: MemoryCandleData;
    gains: number[];
    losses: number[];
  }) => {
    this.lv = params.lv;
    this.cn = params.cn;
    this.rsiData = {
      gains: params.gains,
      losses: params.losses,
    };
  };

  resetRound = () => {
    this.round = defaultRoundData;
  };
}
