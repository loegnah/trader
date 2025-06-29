import { ENV } from "@/env";
import TelegramBot from "node-telegram-bot-api";

class Telegram {
  private bot: TelegramBot;
  private chatId: string;

  constructor() {
    this.bot = new TelegramBot(ENV.TELEGRAM_BOT_TOKEN);
    this.chatId = ENV.TELEGRAM_BOT_CHAT_ID;
  }
}

export const telegram = new Telegram();
