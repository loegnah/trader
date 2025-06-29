import { checkOutlierCandle } from "@/bot/outlier/outlier.lib";
import {
  OUTLIER_CONFIG_LIST,
  OUTLIER_TOPICS,
  type OutlierConfig,
} from "@/bot/outlier/outlier.stg";
import { candleChannel } from "@/channel/candle.channel";
import { MsgTarget } from "@/channel/msg.channel";
import { streamCn } from "@/channel/stream.channel";
import { ENV } from "@/env";
import { runExcStream } from "@/exchange/excStream";
import { Bot } from "@/model/bot.model";
import { Exchange } from "@/type/trade.type";
import type { Candle } from "@/type/trade.type";
import { logger } from "@/util/logger";
import { sendMsgToUser } from "@/util/msg.util";
import TTLCache from "@isaacs/ttlcache";
import { groupBy, mergeMap, throttleTime } from "rxjs";

const THROTTLE_TIME = 1000;

export class OutlierBot extends Bot {
  private readonly configMap = OUTLIER_CONFIG_LIST.reduce(
    (acc, [topic, config]) => {
      acc[topic] = config;
      return acc;
    },
    {} as { [key in string]: OutlierConfig },
  );
  private readonly outlierCache = new TTLCache<string, { changeRatio: number }>(
    {
      ttl: 1000 * ENV.OUTLIER_MSG_TTL,
    },
  );

  constructor(params: { exc: Exchange }) {
    super({ exc: params.exc });
    runExcStream(this.exc);
  }

  async init() {
    await this.reqSubscribe();
    await this.setupHandler();
  }

  private async reqSubscribe() {
    streamCn.subscribe({
      exchange: this.exc,
      data: { topics: OUTLIER_TOPICS },
    });
  }

  private async setupHandler() {
    candleChannel
      .onLive$({ exchange: this.exc })
      .pipe(
        groupBy(({ topic }) => topic),
        mergeMap((group$) => group$.pipe(throttleTime(THROTTLE_TIME))),
      )
      .subscribe(({ topic, data: candle }) =>
        this.handleCandleLive(topic, candle),
      );

    candleChannel
      .onConfirmed$({ exchange: this.exc })
      .subscribe(({ topic, data: candle }) =>
        this.handleCandleConfirmed(topic, candle),
      );
  }

  private handleCandleLive(topic: string, candle: Candle) {
    const config = this.configMap[topic];
    if (!config) return;
    const { isOutlier, changeRatio } = checkOutlierCandle(
      candle,
      config.threshold,
    );
    if (isOutlier) {
      this.handleOutlier(topic, changeRatio);
    }
  }

  private handleCandleConfirmed(_topic: string, _candle: Candle) {
    this.resetCache();
  }

  private handleOutlier(topic: string, changeRatio: number) {
    if (!this.configMap[topic]) return;

    let shouldSendMessage = false;
    const cachedData = this.outlierCache.get(topic);

    if (
      !cachedData || // New data
      Math.sign(changeRatio) !== Math.sign(cachedData.changeRatio) // different direction
    ) {
      shouldSendMessage = true;
    } else {
      const changedDiff = Math.abs(changeRatio - cachedData.changeRatio);
      shouldSendMessage = changedDiff >= this.configMap[topic].step; // step over
    }

    if (shouldSendMessage) {
      this.outlierCache.set(topic, { changeRatio: changeRatio });
      logger.info(
        { topic, changeRatio: changeRatio.toFixed(2) },
        `[outlier-bot] Outlier detected`,
      );
      sendMsgToUser({
        target: MsgTarget.DISCORD,
        title: "Outlier detected",
        topic,
        changed: changeRatio.toFixed(2),
      });
    }
  }

  private resetCache() {
    this.outlierCache.clear();
  }
}
