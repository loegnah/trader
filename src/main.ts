import { initBot } from "@/bot/bot";
import { discord } from "@/lib/discord/discord";

async function main() {
  await discord.init();
  await initBot();
}

main();
