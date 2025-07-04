import type { OutlierConfig } from "@/bot/outlier/outlier.config";
import type { ExchangeClient } from "@/model/ex-client.model";
import type { Candle } from "@/type/trade.type";
import { candleChangeRatio } from "@/util/candle.util";

export class OutlierHelper {
  private readonly conf: OutlierConfig;
  private readonly client: ExchangeClient;

  constructor(params: {
    conf: OutlierConfig;
    client: ExchangeClient;
  }) {
    this.conf = params.conf;
    this.client = params.client;
  }

  checkOutlier = (candle: Candle, topic: string) => {
    const changeRatio = candleChangeRatio(candle);
    return {
      changeRatio,
      isOutlier:
        Math.abs(changeRatio) > this.conf.targetStgMap[topic].threshold,
    };
  };
}
