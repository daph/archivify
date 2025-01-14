import 'dotenv/config';
import { logger } from './utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client, Collection, GatewayIntentBits } from 'discord.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const botToken: string | undefined = process.env.BOT_TOKEN;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
client.cooldowns = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(filePath);

    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
    } else {
        logger.warn(`The command at ${filePath} is missing required properties`);
    }
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = await import(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Log in to Discord with your client's token
if (botToken) {
    client.login(botToken)
} else {
    logger.error("No bot token found!");
}