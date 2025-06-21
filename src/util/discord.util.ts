import { discordChannel } from "@/channel/discord.channel";

export function sendDiscordMsgToUser({
  title,
  ...data
}: {
  title?: string;
  [key: string]: any;
}) {
  const msg = Object.entries(data)
    .map(
      ([key, value]) =>
        `- ${key}: ${typeof value === "string" ? value : value.toString()}`,
    )
    .join("\n");

  discordChannel.emit({
    type: "sendToUser",
    data: {
      msg: `${title ? `[${title}]\n` : ""}${msg}`,
    },
  });
}
