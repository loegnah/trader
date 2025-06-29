import { Subject, filter, map, share } from "rxjs";
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

export enum MsgTarget {
  DISCORD = "discord",
  TELEGRAM = "telegram",
}

type MsgChEvent = {
  target: MsgTarget;
  type: EventDataKey;
  data: EventData[EventDataKey];
};

class MsgChannel {
  public readonly events$ = new Subject<MsgChEvent>();
  public readonly sharedEvents$ = this.events$.pipe(share());

  constructor() {
    this.init();
  }

  async init() {}

  emit(event: MsgChEvent) {
    this.events$.next(event);
  }

  on$(params: {
    target: MsgTarget;
    type: EventDataKey;
  }) {
    return this.sharedEvents$.pipe(
      filter((event) => event.target === params.target),
      filter((event) => event.type === params.type),
      map((event) => $EventData[event.type].parse(event.data)),
    );
  }
}

export const msgChannel = new MsgChannel();
