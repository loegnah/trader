import { MsgTarget, msgChannel } from "@/channel/msg.channel";
import { ENV } from "@/env";
import TelegramBot from "node-telegram-bot-api";

class Telegram {
  private bot: TelegramBot;
  private chatId: string;

  constructor() {
    this.bot = new TelegramBot(ENV.TELEGRAM_BOT_TOKEN);
    this.chatId = ENV.TELEGRAM_BOT_CHAT_ID;
  }

  async init() {
    this.setupListener();
  }

  private setupListener() {
    msgChannel
      .on$({ target: MsgTarget.TELEGRAM, type: "sendToUser" })
      .subscribe(({ msg }) => {
        this.sendMsg(msg);
      });
  }

  private async sendMsg(msg: string) {
    await this.bot.sendMessage(this.chatId, msg);
  }
}

export const telegram = new Telegram();
