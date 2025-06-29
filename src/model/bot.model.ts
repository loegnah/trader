import type { Exchange } from "@/type/trade.type";

export abstract class Bot {
  protected exc: Exchange;

  constructor(params: { exc: Exchange }) {
    this.exc = params.exc;
  }

  abstract init: () => Promise<void>;
  abstract start: () => Promise<void>;
}
