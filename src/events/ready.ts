import { Client, Events } from "discord.js";
import { logger } from "../utils/logger.ts";

// Only run once, on ready

export function readyEvent(client: Client) {
    if (!client.user) {
        logger.error("Client ready called but user is null");
        return;
    }

    logger.info(`Ready! Logged in as ${client.user.tag}`);
}