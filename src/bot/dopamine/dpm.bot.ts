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
import {
  type EventHandlerMap,
  EventType,
  Exchange,
  type PhaseMap,
} from "@/type/trade.type";
import { calcOhlc } from "@/util/candle.util";
import { logger } from "@/util/logger";
import { calcRsi, calcRsiFromGL } from "@/util/rsi";
import { getSideFromTwoCandles, isOutWithSide } from "@/util/side.util";
import { tap } from "rxjs";

export class DopamineBot extends Bot {
  private readonly conf: DopamineConfig;
  private readonly lib: DopamineLib;
  private readonly mem: DopamineMemory;
  private readonly client: ExchangeClient;

  private readonly handlerMap: EventHandlerMap<Phase> = {
    [EventType.CANDLE_CONFIRMED]: {
      [Phase.IDLE]: [],
    },
  };

  private readonly phaseMap: PhaseMap<Phase> = {
    [Phase.IDLE]: {
      handler: {
        [EventType.CANDLE_LIVE]: this.idle_candleCn,
      },
    },
  };

  private phase: Phase = Phase.IDLE;

  constructor(params: { exc: Exchange }) {
    super({ exc: params.exc });
    this.conf = new DopamineConfig();
    this.lib = new DopamineLib({ conf: this.conf });
    this.mem = new DopamineMemory({ conf: this.conf });
    this.client = getExcClient(this.exc);
    runExcStream(this.exc);
  }

  async init() {
    await this.start();
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

  private async reqSubscribe() {
    streamCn.subscribe({
      exchange: this.exc,
      data: { topics: [this.conf.topic] },
    });
  }

  private async setupHandler() {
    candleChannel
      .onConfirmed$({ exchange: this.exc })
      .pipe(
        tap(this.saveDataToMemory(EventType.CANDLE_CONFIRMED)),
        tap(this.makeRsi({ candleType: "cn" })),
      )
      .subscribe(async () => {
        // await this.executeHandlers(EventType.CANDLE_CONFIRMED, this.phase);
        await this.phaseMap[this.phase]?.handler[EventType.CANDLE_LIVE]?.call(
          this,
        );
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

  private async setupInitialData() {
    const LIMIT = 200;
    const candles = await this.client.getCandles({
      symbol: this.conf.symbol,
      interval: this.conf.interval,
      limit: LIMIT,
      withNowCandle: true,
    });
    if (candles.length < LIMIT) {
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
      lv: makeMemoryCandleData({ candle: lvCandle, preCandle: cnCandle }),
      cn: makeMemoryCandleData({
        candle: cnCandle,
        preCandle: candles[2]!,
        rsi: rsiCn,
      }),
      gains,
      losses,
    });
  }

  // ------------------------ common ------------------------

  private async changePhase(phase: Phase) {
    if (this.phase === phase) return;
    this.phaseMap[this.phase]?.handler.end?.();

    logger.info(`[phase] '${this.phase}' -> '${phase}'`);
    this.phase = phase;
    await this.phaseMap[phase]?.handler.starter?.();
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

  private makeRsi(params: { candleType: "cn" | "lv" }) {
    return () => {
      const candleData = this.mem[params.candleType];
      const { candle, preCandle } = candleData;
      const { gains: preGains, losses: preLosses } = this.mem.rsiData;

      const { rsi, gains, losses } = calcRsiFromGL({
        change: candle.close - preCandle.close,
        preGains,
        preLosses,
      });
      this.mem.rsiData = { gains, losses };
      candleData.preRsi = candleData.rsi;
      candleData.rsi = rsi;
    };
  }

  // ------------------------ phase handler ------------------------

  private async idle_candleCn() {
    const { rsi_trigger_first_top, rsi_trigger_first_btm } = this.conf;
    const { rsi, candle, preCandle } = this.mem.cn;
    if (!rsi) {
      throw new Error("'rsi' is not valid");
    }
    const side = getSideFromTwoCandles(candle, preCandle);
    const isTrigger = isOutWithSide(
      rsi,
      rsi_trigger_first_top,
      rsi_trigger_first_btm,
      side,
    );
    if (isTrigger) {
      await this.changePhase(Phase.OUT_RSI);
    }
  }
}
