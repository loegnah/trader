import type { DopamineConfig } from "@/bot/dopamine/dpm.config";

export class DopamineMemory {
  private readonly conf: DopamineConfig;

  constructor(params: { conf: DopamineConfig }) {
    this.conf = params.conf;
  }
}
