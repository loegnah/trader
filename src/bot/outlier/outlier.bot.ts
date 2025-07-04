import { OutlierConfig } from "@/bot/outlier/outlier.config";
import { OutlierHelper } from "@/bot/outlier/outlier.helper";
import { candleChannel } from "@/channel/candle.channel";
import { MsgTarget } from "@/channel/msg.channel";
import { streamCn } from "@/channel/stream.channel";
import { ENV } from "@/env";
import { getExcClient } from "@/exchange/excClient";
import { runExcPublicStream } from "@/exchange/excStream";
import { Bot } from "@/model/bot.model";
import type { ExchangeClient } from "@/model/ex-client.model";
import { Exchange } from "@/type/trade.type";
import type { Candle } from "@/type/trade.type";
import { logger } from "@/util/logger";
import { sendMsgToUser } from "@/util/msg.util";
import TTLCache from "@isaacs/ttlcache";
import { groupBy, mergeMap, throttleTime } from "rxjs";

export class OutlierBot extends Bot {
  private readonly conf: OutlierConfig;
  private readonly helper: OutlierHelper;
  private readonly client: ExchangeClient;

  private readonly msgCache = new TTLCache<string, { changeRatio: number }>({
    ttl: 1000 * ENV.OUTLIER_MSG_TTL,
  });

  constructor(params: { exc: Exchange }) {
    super({ exc: params.exc });
    this.client = getExcClient(this.exc);
    runExcPublicStream({
      exc: this.exc,
      streamParams: {
        isTestnet: ENV.BYBIT_IS_TESTNET,
        isDemoTrading: ENV.BYBIT_IS_DEMO_TRADING,
      },
    });

    this.conf = new OutlierConfig();
    this.helper = new OutlierHelper({
      conf: this.conf,
      client: this.client,
    });
  }

  init = async () => {
    await this.start();
    await this.setupHandler();
  };

  start = async () => {
    await this.reqSubscribe();
  };

  private reqSubscribe = async () => {
    streamCn.subscribe({
      exchange: this.exc,
      data: { topics: this.conf.targetTopics },
    });
  };

  private setupHandler = async () => {
    candleChannel
      .onLive$({ exchange: this.exc })
      .pipe(
        groupBy(({ topic }) => topic),
        mergeMap((group$) =>
          group$.pipe(throttleTime(this.conf.candleEventThrottle)),
        ),
      )
      .subscribe(({ topic, data: candle }) =>
        this.handleCandleLive(topic, candle),
      );

    candleChannel
      .onConfirmed$({ exchange: this.exc })
      .subscribe(({ topic, data: candle }) =>
        this.handleCandleConfirmed(topic, candle),
      );
  };

  private handleCandleLive = (topic: string, candle: Candle) => {
    const config = this.conf.targetStgMap[topic];
    if (!config) return;
    const { isOutlier, changeRatio } = this.helper.checkOutlier(candle, topic);
    if (isOutlier) {
      this.handleOutlier(topic, changeRatio);
    }
  };

  private handleCandleConfirmed = (_topic: string, _candle: Candle) => {
    this.resetCache();
  };

  private handleOutlier = (topic: string, changeRatio: number) => {
    if (!this.conf.targetStgMap[topic]) return;

    let shouldSendMessage = false;
    const cachedData = this.msgCache.get(topic);

    if (
      !cachedData || // New data
      Math.sign(changeRatio) !== Math.sign(cachedData.changeRatio) // different direction
    ) {
      shouldSendMessage = true;
    } else {
      const changedDiff = Math.abs(changeRatio - cachedData.changeRatio);
      shouldSendMessage = changedDiff >= this.conf.targetStgMap[topic].step; // step over
    }

    if (shouldSendMessage) {
      this.msgCache.set(topic, { changeRatio: changeRatio });
      const changedPercent = (changeRatio * 100).toFixed(2);
      logger.info(
        { topic, changeRatio: changedPercent },
        `[outlier-bot] Outlier detected`,
      );
      sendMsgToUser({
        target: MsgTarget.DISCORD,
        title: "Outlier detected",
        topic,
        changed: changedPercent,
      });
    }
  };

  private resetCache = () => {
    this.msgCache.clear();
  };
}
