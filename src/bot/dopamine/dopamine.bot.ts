import { DOPAMINE_TOPICS } from "@/bot/dopamine/dopamine.stg";
import { streamCn } from "@/channel/stream.channel";
import { getExcClient } from "@/exchange/excClient";
import { runExcStream } from "@/exchange/excStream";
import { Bot } from "@/model/bot.model";
import type { ExchangeClient } from "@/model/ex-client.model";
import { Exchange } from "@/type/trade.type";

export class DopamineBot extends Bot {
  private readonly exc: Exchange;
  private readonly client: ExchangeClient;

  private readonly phaseMap = new Map<string, number>();

  constructor(params: { exc: Exchange }) {
    super();
    this.exc = params.exc;
    this.client = getExcClient(this.exc);
    runExcStream(this.exc);
  }

  async init() {
    await this.reqSubscribe();
    await this.setupHandler();
  }

  private async reqSubscribe() {
    streamCn.subscribe({
      exchange: this.exc,
      data: { topics: DOPAMINE_TOPICS },
    });
  }

  private async setupHandler() {}
}
