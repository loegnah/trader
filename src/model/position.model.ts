import { z } from "zod/v4";

export const $Position = z.object();

export type Position = z.infer<typeof $Position>;
