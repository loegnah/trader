import {
  OUTLIER_CONFIG_LIST,
  OUTLIER_TOPICS,
  type OutlierConfig,
} from "@/bot/outlier/outlier.stg";
import { candleChannel } from "@/channel/candle.channel";
import { streamCn } from "@/channel/stream.channel";
import { ENV } from "@/env";
import { Bot } from "@/model/bot.model";
import type { Candle } from "@/model/candle.model";
import { Exchange } from "@/model/ex.model";
import { candleChangeRatio } from "@/util/candle.util";
import { sendDiscordMsgToUser } from "@/util/discord.util";
import { logger } from "@/util/logger";
import TTLCache from "@isaacs/ttlcache";
import { groupBy, mergeMap, throttleTime } from "rxjs";

const THROTTLE_TIME = 1000;

export class OutlierBot extends Bot {
  private readonly NAME = "Candle outlier checker";
  private readonly exc: Exchange;
  private readonly configMap = OUTLIER_CONFIG_LIST.reduce(
    (acc, [topic, config]) => {
      acc[topic] = config;
      return acc;
    },
    {} as { [key in string]: OutlierConfig },
  );
  private readonly outlierCache = new TTLCache<string, { changed: number }>({
    ttl: 1000 * ENV.BOT_OUTLIER_MSG_TTL,
  });

  constructor(params: { exc: Exchange }) {
    super();
    this.exc = params.exc;
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
    const retCheckOutlier = this.checkOutlier(topic, candle);
    if (retCheckOutlier?.isOutlier) {
      this.handleOutlier(topic, retCheckOutlier.changed);
    }
  }

  private handleCandleConfirmed(_topic: string, _candle: Candle) {
    this.resetCache();
  }

  private checkOutlier(topic: string, candle: Candle) {
    const config = this.configMap[topic];
    if (!config) return;

    const changed = candleChangeRatio(candle) * 100;
    return { changed, isOutlier: Math.abs(changed) > config.threshold };
  }

  private handleOutlier(topic: string, changed: number) {
    let shouldSendMessage = false;
    const cachedData = this.outlierCache.get(topic);

    if (!cachedData) {
      shouldSendMessage = true;
    } else {
      const changedDiff = Math.abs(changed - cachedData.changed);
      shouldSendMessage = changedDiff >= this.configMap[topic]!.step;
    }

    if (shouldSendMessage) {
      this.outlierCache.set(topic, { changed: changed });
      logger.info(
        `[outlier-bot] ${topic} is outlier! (${changed.toFixed(2)}%)`,
      );
      sendDiscordMsgToUser({
        title: "Checked outlier",
        topic,
        changed: changed.toFixed(2),
      });
    }
  }

  private resetCache() {
    this.outlierCache.clear();
  }
}
