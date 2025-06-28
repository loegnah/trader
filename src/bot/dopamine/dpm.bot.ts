import {
  DopamineConfig,
  DopaminePhase as Phase,
} from "@/bot/dopamine/dpm.config";
import { DopamineLib } from "@/bot/dopamine/dpm.lib";
import { DopamineMemory } from "@/bot/dopamine/dpm.memory";
import { type CandleChEvent, candleChannel } from "@/channel/candle.channel";
import { streamCn } from "@/channel/stream.channel";
import { getExcClient } from "@/exchange/excClient";
import { runExcStream } from "@/exchange/excStream";
import { Bot } from "@/model/bot.model";
import type { ExchangeClient } from "@/model/ex-client.model";
import { type EventHandlerMap, EventType, Exchange } from "@/type/trade.type";
import { logger } from "@/util/logger";
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
      .pipe(tap(this.saveDataToMemory("candleCn")))
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

  private saveDataToMemory(type: "candleCn" | "candleLv") {
    switch (type) {
      case "candleCn":
        return ({ data }: CandleChEvent) => {
          this.mem.round.candleCn = data;
        };
      case "candleLv":
        return ({ data }: CandleChEvent) => {
          this.mem.round.candleLv = data;
        };
    }
  }

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
