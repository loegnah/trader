import {
  DopamineConfig,
  DopaminePhase as Phase,
} from "@/bot/dopamine/dpm.config";
import { DopamineLib } from "@/bot/dopamine/dpm.lib";
import { DopamineMemory } from "@/bot/dopamine/dpm.memory";
import { type CandleChEvent, candleChannel } from "@/channel/candle.channel";
import { streamCn } from "@/channel/stream.channel";
import { ENV } from "@/env";
import { getExcClient } from "@/exchange/excClient";
import { runExcStream } from "@/exchange/excStream";
import { Bot } from "@/model/bot.model";
import type { ExchangeClient } from "@/model/ex-client.model";
import { type EventHandlerMap, EventType, Exchange } from "@/type/trade.type";
import { calcOhlc, candleSide } from "@/util/candle.util";
import { logger } from "@/util/logger";
import { calcRsi } from "@/util/rsi";
import { last } from "es-toolkit";
import { tap } from "rxjs";

export class DopamineBot extends Bot {
  private readonly conf: DopamineConfig;
  private readonly lib: DopamineLib;
  private readonly mem: DopamineMemory;
  private readonly client: ExchangeClient;

  private readonly handlerMap: EventHandlerMap<Phase> = {
    [EventType.CANDLE_CONFIRMED]: {
      [Phase.IDLE]: [this.candleLiveHandler1, this.candleLiveHandler2],
      [Phase.PHASE_1]: [this.candleLiveHandler3],
    },
  };

  private phase: Phase = Phase.IDLE;

  constructor(params: { exc: Exchange }) {
    super({ exc: params.exc });
    this.conf = new DopamineConfig();
    this.lib = new DopamineLib({ conf: this.conf });
    this.mem = new DopamineMemory({ conf: this.conf });
    this.client = getExcClient(this.exc);
  }

  async init() {
    runExcStream(this.exc);
    await this.setupAccountSetting();
    await this.reqSubscribe();
    await this.setupHandler();
    await this.start();
  }

  async start() {
    await this.setupInitialData();
    await this.setupInitialState();
  }

  // ------------------------ setup ------------------------
  private async setupAccountSetting() {
    await this.client.setLeverage({
      symbol: this.conf.symbol,
      leverage: this.conf.leverage,
    });
  }

  private async reqSubscribe() {
    streamCn.subscribe({
      exchange: this.exc,
      data: { topics: [this.conf.topic] },
    });
  }

  private async setupHandler() {
    candleChannel
      .onConfirmed$({ exchange: this.exc })
      .pipe(tap(this.saveDataToMemory(EventType.CANDLE_CONFIRMED)))
      .subscribe(async () => {
        await this.executeHandlers(EventType.CANDLE_CONFIRMED, this.phase);
      });
  }

  private async executeHandlers(eventType: EventType, phase: Phase) {
    const handlers = this.handlerMap[eventType]?.[phase];
    if (!handlers) return;

    for await (const handler of handlers) {
      try {
        await handler.call(this);
      } catch (error) {
        logger.error(
          `Handler execution failed for ${eventType}/${phase}:`,
          error,
        );
        return;
      }
    }
  }

  private saveDataToMemory(type: EventType) {
    switch (type) {
      case EventType.CANDLE_CONFIRMED:
        return ({ data }: CandleChEvent) => {
          this.mem.cn.candle = data;
        };
      case EventType.CANDLE_LIVE:
        return ({ data }: CandleChEvent) => {
          this.mem.lv.candle = data;
        };
    }
  }

  private setupInitialData = async () => {
    const candles = await this.client
      .getCandles({
        symbol: this.conf.symbol,
        interval: this.conf.interval,
        limit: 200,
      })
      .then((ret) => ret.reverse());
    if (!candles.length) {
      logger.error("[setupInitialData] no candles");
      throw new Error("no candles");
    }
    const { gains, losses, rsi } = calcRsi({
      prices: candles.map((candle) => calcOhlc(candle)),
    });
    const latestCandle = last(candles)!;

    this.mem.gains = gains;
    this.mem.losses = losses;
    this.mem.cn = {
      candle: latestCandle,
      side: candleSide(latestCandle),
      ohlc: calcOhlc(latestCandle),
      rsi,
    };
    logger.info(
      {
        phase: this.phase,
        rsi: this.mem.cn.rsi,
      },
      "[Initial data]",
    );
  };

  private async setupInitialState() {
    if (ENV.OUTLIER_RESET_STATE) {
      logger.info("[setupInitialState] reset all positions and orders");
      await this.client.closeAllPositions({
        symbol: this.conf.symbol,
      });
      await this.client.cancelAllOrders({
        symbol: this.conf.symbol,
      });
    }
  }

  // ------------------------ handler ------------------------

  private async candleLiveHandler1() {
    console.log("candleLiveHandler1");
  }
  private async candleLiveHandler2() {
    console.log("candleLiveHandler2");
    this.phase = Phase.PHASE_1;
  }

  private async candleLiveHandler3() {
    console.log("candleLiveHandler3");
  }
}
