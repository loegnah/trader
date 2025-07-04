import { ENV } from "@/env";
import dayjs from "dayjs";
import pino from "pino";

const LOG_FILE_NAME = dayjs().format("YYYYMMDD-HHmmss");
export const logger = pino(
  { level: ENV.LOG_LEVEL_CONSOLE },
  pino.transport({
    targets: [
      {
        level: ENV.LOG_LEVEL_CONSOLE,
        target: "pino-pretty",
        options: {},
      },
      ...(ENV.LOG_IS_FILE_SAVE
        ? [
            {
              level: "trace",
              target: "pino/file",
              options: {
                destination: `log/${LOG_FILE_NAME}.log`,
                mkdir: true,
              },
            },
          ]
        : []),
    ],
  }),
);
