import { makeMemoryCandleData } from "@/bot/bot.util";
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
import { calcOhlc } from "@/util/candle.util";
import { logger } from "@/util/logger";
import { calcRsi } from "@/util/rsi";
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
    await this.start();
    runExcStream(this.exc);
    await this.setupHandler();
  }

  async start() {
    await this.setupAccountSetting();
    await this.setupInitialData();
    await this.reqSubscribe();

    logger.info(
      {
        phase: this.phase,
        rsi: this.mem.cn.rsi,
      },
      "[START]",
    );
  }

  // ------------------------ setup ------------------------
  private async setupAccountSetting() {
    await this.client.setLeverage({
      symbol: this.conf.symbol,
      leverage: this.conf.leverage,
    });
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
    const candles = await this.client.getCandles({
      symbol: this.conf.symbol,
      interval: this.conf.interval,
      limit: 200,
      withNowCandle: true,
    });
    if (candles.length < 2) {
      logger.error("[setupInitialData] no candles");
      throw new Error("no candles");
    }
    const [lvCandle, cnCandle] = [candles[0]!, candles[1]!];
    const {
      rsi: rsiCn,
      gains,
      losses,
    } = calcRsi({
      prices: candles.slice(0, -1).map(calcOhlc).reverse(),
    });

    this.mem.init({
      lv: makeMemoryCandleData({ candle: lvCandle }),
      cn: makeMemoryCandleData({ candle: cnCandle, rsi: rsiCn }),
      gains,
      losses,
    });
  };

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
