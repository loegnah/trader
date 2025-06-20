import { logger } from "@/util/logger";
import {
  type CacheType,
  type ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

export type DiscordCmd = {
  name: string;
  builder: SlashCommandBuilder;
  handler: (intAct: ChatInputCommandInteraction<CacheType>) => Promise<any>;
};

export const DISCORD_CMD_LIST: DiscordCmd[] = [
  {
    name: "bot-start",
    builder: new SlashCommandBuilder()
      .setName("bot-start")
      .setDescription("Start the bot."),
    handler: async (interaction) => {
      logger.trace("[discord-cmd] bot-start");
      interaction.reply({
        content: `Started bot.`,
        flags: MessageFlags.Ephemeral,
      });
    },
  },
  {
    name: "bot-stop",
    builder: new SlashCommandBuilder()
      .setName("bot-stop")
      .setDescription("Stop the bot."),
    handler: async (interaction) => {
      logger.trace("[discord-cmd] bot-stop");
      interaction.reply({
        content: `Stopped bot.`,
        flags: MessageFlags.Ephemeral,
      });
    },
  },
];
