import { sum } from "es-toolkit";

const DEFAULT_PERIOD = 14;

export enum RSI_SECTION {
  HIGH = "HIGH",
  MIDDLE = "MIDDLE",
  LOW = "LOW",
}

// 가격 리스트를 받아서 gain, loss 리스트를 구하는 함수
export function calcGL(prices: number[]) {
  if (prices.length < 2) {
    throw new Error("prices length must be greater than 2");
  }
  const changes = prices.slice(1).map((price, index) => price - prices[index]!); // 현재 - 이전을 부호있는 값으로

  return {
    gains: changes.map((change) => Math.max(change, 0)),
    losses: changes.map((change) => Math.abs(Math.min(change, 0))),
  };
}

// gain, loss 리스트를 받아서 평균 gain, loss를 구하는 함수
export function calcAvgGL({
  gains,
  losses,
  period = DEFAULT_PERIOD,
}: {
  gains: number[];
  losses: number[];
  period?: number;
}) {
  let avgGain = sum(gains.slice(0, period)) / period;
  let avgLoss = sum(losses.slice(0, period)) / period;
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]!) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]!) / period;
  }
  return { avgGain, avgLoss };
}
// 가격 리스트를 받아서 가장 최신의 RSI 및 gain, loss 등을 구하는 함수
export function calcRsi({
  prices,
  period = DEFAULT_PERIOD,
}: {
  prices: number[];
  period?: number;
}) {
  if (prices.length < 2) {
    throw new Error("prices length must be greater than 2");
  }
  const { gains, losses } = calcGL(prices);
  const { avgGain, avgLoss } = calcAvgGL({ gains, losses, period });
  const rsi = _calcRsiByGainLoss(avgGain, avgLoss);
  return { rsi, gains, losses, avgGain, avgLoss };
}

// gain, loss 리스트를 받아서 가장 최신의 RSI 및 gain, loss 등을 구하는 함수
export function calcRsiFromGL({
  change,
  preGains,
  preLosses,
  period = DEFAULT_PERIOD,
}: {
  change: number;
  preGains: number[];
  preLosses: number[];
  period?: number;
}) {
  const gains = [...preGains.slice(1), Math.max(change, 0)];
  const losses = [...preLosses.slice(1), Math.abs(Math.min(change, 0))];
  const { avgGain, avgLoss } = calcAvgGL({ gains, losses, period });
  return {
    rsi: _calcRsiByGainLoss(avgGain, avgLoss),
    gains,
    losses,
  };
}

// 이전 데이터를 받아서 가장 최신의 RSI 및 gain, loss 등을 구하는 함수
export function calcRsiWithPreData({
  change,
  preAvgGain,
  preAvgLoss,
  period = DEFAULT_PERIOD,
}: {
  change: number;
  preAvgGain: number;
  preAvgLoss: number;
  period?: number;
}): { rsi: number; avgGain: number; avgLoss: number } {
  const gain = Math.max(change, 0);
  const loss = Math.abs(Math.min(change, 0));
  const avgGain = (preAvgGain * (period - 1) + gain) / period;
  const avgLoss = (preAvgLoss * (period - 1) + loss) / period;
  return { rsi: _calcRsiByGainLoss(avgGain, avgLoss), avgGain, avgLoss };
}

function _calcRsiByGainLoss(avgGain: number, avgLoss: number) {
  return 100 - 100 / (1 + avgGain / avgLoss);
}
