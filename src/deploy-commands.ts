import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { REST, Routes } from "discord.js";
import { type ArchivifyCommand } from './@types/archivifyCommand.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const botToken: string | undefined = process.env.BOT_TOKEN;
const appId: string | undefined = process.env.APP_ID

if (!botToken) {
    console.error("No bot token found!")
    process.exitCode = 1;
}

if (!appId) {
    console.error("No app id found!")
    process.exitCode = 1;
}

const commands: Array<ArchivifyCommand> = [];

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(filePath);

    if ("data" in command && "execute" in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing required properties`);
    }
}

const rest = new REST().setToken(botToken!);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        const data = await rest.put(
            Routes.applicationCommands(appId!),
            { body: commands },
        ) as Array<object>;
        console.log(`Refreshed ${data.length} application (/) commands.`)
    } catch (error) {
        console.error(error);
    }
})();
