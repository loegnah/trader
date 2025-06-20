import { discordChannel } from "@/channel/discord.channel";
import { ENV } from "@/env";
import { logger } from "@/util/logger";
import chalk from "chalk";
import {
  Client,
  Events,
  GatewayIntentBits,
  type Interaction,
  TextChannel,
  User,
} from "discord.js";

class Discord {
  private client = new Client({ intents: [GatewayIntentBits.Guilds] });
  private targetUser?: User;

  async init() {
    this.setupListener();
    await this.client.login(ENV.DISCORD_BOT_TOKEN);
    if (ENV.DISCORD_BOT_CMD_RESET) {
      this.resetCmd();
    }
  }

  private async setupListener() {
    this.client.once(Events.ClientReady, (readyClient) => {
      logger.trace(
        chalk.cyan(`[Discord] Connected as ${readyClient.user.tag}`),
      );
    });
    if (ENV.DISCORD_BOT_CMD_LISTEN) {
      this.client.on(Events.InteractionCreate, this.handleInteraction);
    }
    if (ENV.DISCORD_BOT_SEND_MSG) {
      discordChannel.on((event) => {
        this.sendMsgToUser(event.msg);
      });
    }
  }

  async sendMsgToUser(msg: string) {
    if (!this.targetUser) {
      this.targetUser = await this.client.users.fetch(ENV.DISCORD_USER_ID);
    }
    await this.targetUser?.send(msg);
  }

  async sendMsgToChannel(channelId: string, msg: string) {
    const channel = await this.client.channels.fetch(channelId);

    if (channel instanceof TextChannel) {
      await channel.send(msg);
    } else {
      logger.error("The provided channel is not a text channel");
    }
  }

  private async resetCmd() {
    // TODO: Implement
    //   const builders = Object.values(discordCommands).map(({ builder }) =>
    //     builder.toJSON(),
    //   );
    //   const discordREST = new REST().setToken(ENV.DISCORD_BOT_TOKEN);
    //   const ret = (await this.discordREST.put(
    //     Routes.applicationCommands(appEnv.DISCORD_APP_ID),
    //     { body: builders },
    //   )) as RESTPutAPIApplicationCommandsResult;
    //   const originalCommands = Object.keys(discordCommands);
    //   const doneCommands = ret.map(({ name }) => name);
    //   const failedCommands = originalCommands.filter(
    //     (command) => !doneCommands.includes(command),
    //   );
    //   console.log(
    //     `[discord] Registered Commands. (origin: ${originalCommands.length} / done: ${doneCommands.length} / failed: ${failedCommands.length})`,
    //   );
    //   if (failedCommands.length > 0) {
    //     console.warn(`Failed commands: ${failedCommands.join(", ")}`);
    //   }
  }

  private async handleInteraction(interaction: Interaction) {
    // TODO: Implement
    if (interaction.isChatInputCommand()) {
      console.debug(interaction.commandName);
    }
    //   console.log(interaction.user.id);
    //   if (!interaction.isChatInputCommand()) return;
    //   console.log(
    //     chalk.green.underline(
    //       `[Discord] Interaction: ${interaction.commandName}`,
    //     ),
    //   );
    //   await discordCommands[interaction.commandName].handler(interaction);
  }
}

export const discord = new Discord();
