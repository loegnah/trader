import { Subject, filter, map, share, tap } from "rxjs";
import { z } from "zod/v4";

const $EventData = {
  sendToUser: z.object({
    msg: z.string(),
  }),
};

type EventDataKey = keyof typeof $EventData;
type EventData = {
  [key in EventDataKey]: z.infer<(typeof $EventData)[key]>;
};

type DiscordCnEvent = {
  type: EventDataKey;
  data: EventData[EventDataKey];
};

class DiscordChannel {
  public readonly events$ = new Subject<DiscordCnEvent>();
  public readonly sharedEvents$ = this.events$.pipe(share());

  constructor() {
    this.init();
  }

  async init() {}

  emit(event: DiscordCnEvent) {
    this.events$.next(event);
  }

  onSendToUser$() {
    return this.sharedEvents$.pipe(
      filter((event) => event.type === "sendToUser"),
      map((event) => $EventData[event.type].parse(event.data)),
    );
  }
}

export const discordChannel = new DiscordChannel();
