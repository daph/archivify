import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export interface ArchivifyCommand {
    data: SlashCommandBuilder;
    cooldown: number | undefined;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}