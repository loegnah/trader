import { OUTLIER_SYMBOLS } from "@/bot/outlier/outlier.stg";
import { candleChannel } from "@/channel/candle.channel";
import { streamCn } from "@/channel/stream.channel";
import { Bot } from "@/model/bot.model";
import type { Candle } from "@/model/candle.model";
import { Exchange } from "@/model/ex.model";

export class OutlierBot extends Bot {
  private readonly NAME = "Candle outlier checker";
  private readonly exc: Exchange;

  constructor(params: { exc: Exchange }) {
    super();
    this.exc = params.exc;
  }

  async init() {
    await this.reqSubscribe();
    await this.setupHandler();
  }

  async reqSubscribe() {
    streamCn.subscribe({
      exchange: this.exc,
      data: { symbols: OUTLIER_SYMBOLS },
    });
  }

  async setupHandler() {
    candleChannel
      .onLive$({ exchange: this.exc })
      .subscribe(({ data: candle }) => {
        this.checkOutlier({ candle });
      });
  }

  checkOutlier({ candle }: { candle: Candle }) {
    console.log(candle);
  }
}
