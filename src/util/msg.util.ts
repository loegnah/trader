import { type MsgTarget, msgChannel } from "@/channel/msg.channel";

export function sendMsgToUser({
  target,
  title,
  ...data
}: {
  target: MsgTarget;
  title?: string;
  [key: string]: any;
}) {
  const msg = Object.entries(data)
    .map(
      ([key, value]) =>
        `- ${key}: ${typeof value === "string" ? value : value.toString()}`,
    )
    .join("\n");

  msgChannel.emit({
    target,
    type: "sendToUser",
    data: {
      msg: `${title ? `[${title}]\n` : ""}${msg}`,
    },
  });
}
