import { Subject, share, tap } from "rxjs";

export type DiscordChannelEvent = {
  msg: string;
};

class DiscordChannel {
  public readonly events$ = new Subject<DiscordChannelEvent>();
  public readonly sharedEvents$ = this.events$.pipe(share());

  constructor() {
    this.init();
  }

  async init() {}

  emit(event: DiscordChannelEvent) {
    this.events$.next(event);
  }

  on(handler: (data: DiscordChannelEvent) => void) {
    return this.sharedEvents$.pipe(tap(handler));
  }
}

export const discordChannel = new DiscordChannel();
