import { pino } from 'pino';

const LEVEL = process.env.LOG_LEVEL ?? "error";

export const logger = pino({
    name: "archivify",
    level: LEVEL
});