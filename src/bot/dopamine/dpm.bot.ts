import { makeMemoryCandleData } from "@/bot/bot.util";
import {
  DopamineConfig,
  DopaminePhase as Phase,
} from "@/bot/dopamine/dpm.config";
import { DopamineHelper } from "@/bot/dopamine/dpm.helper";
import { DopamineMemory } from "@/bot/dopamine/dpm.memory";
import { candleChannel } from "@/channel/candle.channel";
import { orderChannel } from "@/channel/order.channel";
import { positionChannel } from "@/channel/position.channel";
import { streamCn } from "@/channel/stream.channel";
import { ENV } from "@/env";
import { getExcClient } from "@/exchange/excClient";
import { runExcStream } from "@/exchange/excStream";
import { Bot } from "@/model/bot.model";
import type { ExchangeClient } from "@/model/ex-client.model";
import { EventType, Exchange, type PhaseMap } from "@/type/trade.type";
import { calcOhlc } from "@/util/candle.util";
import { logger } from "@/util/logger";
import { calcRsi } from "@/util/rsi";
import { filter, map, tap } from "rxjs";

export class DopamineBot extends Bot {
  private readonly conf: DopamineConfig;
  private readonly helper: DopamineHelper;
  private readonly mem: DopamineMemory;
  private readonly client: ExchangeClient;

  private readonly phaseMap: PhaseMap<Phase>;

  private phase: Phase = Phase.ENTER;

  constructor(params: { exc: Exchange }) {
    super({ exc: params.exc });
    this.client = getExcClient(this.exc);
    runExcStream(this.exc);

    this.conf = new DopamineConfig();
    this.mem = new DopamineMemory({ conf: this.conf });
    this.helper = new DopamineHelper({
      conf: this.conf,
      mem: this.mem,
      client: this.client,
    });

    this.phaseMap = {
      [Phase.IDLE]: {
        handler: {
          [EventType.CANDLE_LIVE]: this.idle_candleCn,
        },
      },
      [Phase.OUT_RSI]: {
        handler: {
          [EventType.CANDLE_LIVE]: this.outRsi_candleCn,
        },
      },
      [Phase.ENTER]: {
        handler: {
          [EventType.STARTER]: this.order_starter,
          [EventType.POSITION]: this.enter_position,
          [EventType.ORDER]: this.enter_order,
        },
      },
    };
  }

  init = async () => {
    await this.start();
    await this.setupHandler();
  };

  start = async () => {
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
  };

  // ------------------------ setup ------------------------

  private reqSubscribe = async () => {
    streamCn.subscribe({
      exchange: this.exc,
      data: { topics: [this.conf.topic] },
    });
  };

  private setupHandler = async () => {
    candleChannel
      .onConfirmed$({ exchange: this.exc })
      .pipe(
        tap(this.helper.saveDataToMemory(EventType.CANDLE_CONFIRMED) as any),
        tap(this.helper.makeRsi({ candleType: "cn" })),
      )
      .subscribe(async () => {
        await this.phaseMap[this.phase]?.handler[EventType.CANDLE_LIVE]?.();
      });

    orderChannel
      .on$({ exchange: this.exc })
      .pipe(
        map(({ orders }) => ({
          orders: orders.filter(({ symbol }) => symbol === this.conf.symbol),
        })),
        tap(this.helper.saveDataToMemory(EventType.ORDER) as any),
      )
      .subscribe(async () => {
        await this.phaseMap[this.phase]?.handler[EventType.ORDER]?.();
      });

    positionChannel
      .on$({ exchange: this.exc })
      .pipe(
        map(({ positions }) => ({
          position: positions.find(({ symbol }) => symbol === this.conf.symbol),
        })),
        filter(({ position }) => !!position),
        tap(this.helper.saveDataToMemory(EventType.POSITION) as any),
      )
      .subscribe(async () => {
        await this.phaseMap[this.phase]?.handler[EventType.POSITION]?.();
      });
  };

  private setupAccountSetting = async () => {
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
  };

  private setupInitialData = async () => {
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
  };

  // ------------------------ common ------------------------

  private changePhase = async (phase: Phase) => {
    if (this.phase === phase) return;
    this.phaseMap[this.phase]?.handler.end?.();

    logger.info(`[phase] '${this.phase}' -> '${phase}'`);
    this.phase = phase;
    await this.phaseMap[phase]?.handler.starter?.();
  };

  // ------------------------ phase handler ------------------------

  private idle_candleCn = async () => {
    const { rsi, candle } = this.mem.cn;
    if (!rsi) {
      throw new Error("[idle_candleCn] invalid data");
    }
    const { triggerLevel, side } = this.helper.checkTriggerLevel({
      candle,
      rsi,
    });
    if (triggerLevel) {
      this.mem.round.triggerLevel = triggerLevel;
      this.mem.round.positionSide = side;
      this.helper.checkPoint({ candle });
      await this.changePhase(Phase.OUT_RSI);
    }
  };

  private outRsi_candleCn = async () => {
    const { rsi, candle } = this.mem.cn;
    const { triggerLevel: preTriggerLevel } = this.mem.round;
    if (!preTriggerLevel || !rsi) {
      throw new Error("[outRsi_candleCn] invalid data");
    }
    this.helper.checkPoint({ candle });
    const { triggerLevel } = this.helper.checkTriggerLevel({
      candle,
      rsi,
    });
    if (preTriggerLevel! < triggerLevel) {
      this.mem.round.triggerLevel = triggerLevel;
      logger.info(
        { triggerLevel, rsi },
        "[outRsi_candleCn] New trigger level found",
      );
      return;
    }
    if (preTriggerLevel! > triggerLevel) {
      await this.changePhase(Phase.ENTER);
    }
  };

  private order_starter = async () => {
    const { positionSide } = this.mem.round;
    if (!positionSide) {
      throw new Error("[order_starter] invalid data");
    }
    await this.helper.reqEntryOrder({
      price: this.mem.cn.candle.close,
      side: positionSide,
    });
  };

  private enter_position = async () => {
    const { position } = this.mem;
    if (!position) {
      throw new Error("[enter_position] invalid data");
    }
    logger.trace({ position }, "[enter_position] position");
  };

  private enter_order = async () => {
    const { orders } = this.mem;
    if (!orders) {
      throw new Error("[enter_order] invalid data");
    }
    logger.trace({ orders }, "[enter_order] orders");
  };
}
