import { Client, Events } from "discord.js";
import { logger } from "../utils/logger.js";

export const name = Events.ClientReady;
export const once = true;

export function execute(client: Client) {
    if (!client.user) {
        logger.error("Client ready called but user is null");
        return;
    }

    logger.info(`Ready! Logged in as ${client.user.tag}`);
}