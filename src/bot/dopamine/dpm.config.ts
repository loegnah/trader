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
  symbol = "BTCUSDT";
  topic = "kline.5.BTCUSDT";
  leverage = 20;
}
