import { DopamineBot } from "@/bot/dopamine/dopamine.bot";
import { OutlierBot } from "@/bot/outlier/outlier.bot";
import { ENV } from "@/env";
import type { Bot } from "@/model/bot.model";
import { Exchange } from "@/type/trade.type";

const runningBots = new Map<string, Bot>();

export async function initBot() {
  if (ENV.BOT_OUTLIER_RUN) {
    const outlierBot = new OutlierBot({ exc: Exchange.BYBIT });
    await outlierBot.init();
    runningBots.set("outlier", outlierBot);
  }

  if (ENV.BOT_DOPAMINE_RUN) {
    const dopamineBot = new DopamineBot({ exc: Exchange.BYBIT });
    await dopamineBot.init();
    runningBots.set("dopamine", dopamineBot);
  }
}
