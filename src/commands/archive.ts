import { archive } from "../modules/archive.js";
import { logger } from "../utils/logger.js";
import { extract } from "@extractus/article-extractor";
import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";


export const cooldown = 5;

export const data = new SlashCommandBuilder()
    .setName("archive")
    .setDescription("Archives a url with archive.today")
    .addStringOption(option =>
        option.setName("url")
            .setDescription("Url to archive")
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const url_option = interaction.options.getString("url");
    if (!url_option) return await interaction.reply("No url provided");
    const msgFooter = `Archived link requested by <@${interaction.user.id}>`
    try {
        await interaction.reply({
            content: `Archiving <${url_option}>`,
            flags: MessageFlags.Ephemeral
        });
        const urlObj = new URL(url_option);
        const extracted = await extract(url_option)
        const doneUrl = await archive(urlObj);
        if (extracted) {
            await interaction.followUp(
                `<${doneUrl}>\n> **${extracted.title}**\n\n> ${extracted.description}\n${msgFooter}`
            );
        } else {
            await interaction.followUp(`${doneUrl}\n${msgFooter}`);
        }
    } catch (err) {
        logger.error(err);
        return await interaction.followUp(`There was an error archiving ${url_option}\n${msgFooter}`);
    }
}