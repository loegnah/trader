import { DOPAMINE_PHASE, DopamineConfig } from "@/bot/dopamine/dpm.config";
import { DopamineLib } from "@/bot/dopamine/dpm.lib";
import { DopamineMemory } from "@/bot/dopamine/dpm.memory";
import { streamCn } from "@/channel/stream.channel";
import { getExcClient } from "@/exchange/excClient";
import { runExcStream } from "@/exchange/excStream";
import { Bot } from "@/model/bot.model";
import type { ExchangeClient } from "@/model/ex-client.model";
import { Exchange, type PhaseMap } from "@/type/trade.type";

export class DopamineBot extends Bot {
  private readonly conf: DopamineConfig;
  private readonly lib: DopamineLib;
  private readonly memory: DopamineMemory;

  private readonly exc: Exchange;
  private readonly client: ExchangeClient;

  private readonly phaseMap: PhaseMap<DOPAMINE_PHASE> = {
    [DOPAMINE_PHASE.IDLE]: {
      handler: {},
    },
  };

  constructor(params: { exc: Exchange }) {
    super();
    this.exc = params.exc;
    this.conf = new DopamineConfig();
    this.lib = new DopamineLib({ conf: this.conf });
    this.memory = new DopamineMemory({ conf: this.conf });
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

  private async setupHandler() {}
}
