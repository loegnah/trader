import { initBot } from "@/bot/bot";
import { ENV } from "@/env";
import { discord } from "@/lib/discord/discord";
import { telegram } from "@/lib/telegram/telegram";

async function main() {
  if (ENV.DISCORD_IS_RUN) {
    await discord.init();
  }
  // await telegram.init();
  await initBot();
}

main();
