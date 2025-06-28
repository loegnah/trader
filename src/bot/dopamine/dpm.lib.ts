import { DopamineConfig } from "@/bot/dopamine/dpm.config";

export class DopamineLib {
  private readonly conf: DopamineConfig;

  constructor(params: { conf: DopamineConfig }) {
    this.conf = params.conf;
  }
}
