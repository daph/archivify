import { type ChatInputCommandInteraction, type SlashCommandBuilder, type SlashCommandOptionsOnlyBuilder } from "discord.js";

export interface ArchivifyCommand {
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
    cooldown: number | undefined;
    execute: (interaction: ChatInputCommandInteraction) => Promise<InteractionResponse<boolean> | Message<boolean> | undefined>
}