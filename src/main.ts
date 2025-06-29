import { initBot } from "@/bot/bot";
import { discord } from "@/lib/discord/discord";
import { telegram } from "@/lib/telegram/telegram";

async function main() {
  await discord.init();
  await telegram.init();
  await initBot();
}

main();
