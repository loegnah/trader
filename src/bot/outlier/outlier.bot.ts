import {
  OUTLIER_CONFIG_LIST,
  OUTLIER_SYMBOLS,
  type OutlierConfig,
} from "@/bot/outlier/outlier.stg";
import { candleChannel } from "@/channel/candle.channel";
import { streamCn } from "@/channel/stream.channel";
import { Bot } from "@/model/bot.model";
import type { Candle } from "@/model/candle.model";
import { Exchange } from "@/model/ex.model";
import { candleChangeRatio } from "@/util/candle.util";
import { sendDiscordMsgToUser } from "@/util/discord.util";
import { logger } from "@/util/logger";
import { groupBy, mergeMap, throttleTime } from "rxjs";

const THROTTLE_TIME = 1000;

export class OutlierBot extends Bot {
  private readonly NAME = "Candle outlier checker";
  private readonly exc: Exchange;
  private readonly configMap = OUTLIER_CONFIG_LIST.reduce(
    (acc, [symbol, config]) => {
      acc[symbol] = config;
      return acc;
    },
    {} as { [key in string]: OutlierConfig },
  );

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
      data: { symbols: OUTLIER_SYMBOLS },
    });
  }

  private async setupHandler() {
    candleChannel
      .onLive$({ exchange: this.exc })
      .pipe(
        groupBy(({ symbol }) => symbol),
        mergeMap((group$) => group$.pipe(throttleTime(THROTTLE_TIME))),
      )
      .subscribe(({ symbol, data: candle }) =>
        this.handleCandle(symbol, candle),
      );
  }

  private handleCandle(symbol: string, candle: Candle) {
    const retCheckOutlier = this.checkOutlier(symbol, candle);
    if (retCheckOutlier?.isOutlier) {
      const { changed } = retCheckOutlier;
      logger.info(
        `[outlier-bot] ${symbol} is outlier! (${changed.toFixed(2)}%)`,
      );
      sendDiscordMsgToUser({
        title: "Checked outlier",
        symbol,
        changed: changed.toFixed(2),
      });
    }
  }

  private checkOutlier(symbol: string, candle: Candle) {
    const config = this.configMap[symbol];
    if (!config) return;

    const changed = candleChangeRatio(candle) * 100;
    return { changed, isOutlier: Math.abs(changed) > config.threshold };
  }
}
