import { logger } from './utils/logger.ts';
import { Client, Collection, Events, GatewayIntentBits, type Interaction } from 'discord.js';
import { archivifyCommand } from "./commands/archive.ts"
import { interactionCreateEvent } from './events/interactionCreate.ts';
import { readyEvent } from './events/ready.ts';

const botToken: string | undefined = process.env.BOT_TOKEN;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
client.cooldowns = new Collection();

client.commands.set(archivifyCommand.data.name, archivifyCommand);

client.once(Events.ClientReady, readyEvent);
client.on(Events.InteractionCreate, interactionCreateEvent);

// Log in to Discord with your client's token
if (botToken) {
    client.login(botToken)
} else {
    logger.error("No bot token found!");
}