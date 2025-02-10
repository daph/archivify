import { archive } from "../modules/archive.ts";
import { logger } from "../utils/logger.ts";
import { extract } from "@extractus/article-extractor";
import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";


const cooldown = 5;

const data = new SlashCommandBuilder()
    .setName("archive")
    .setDescription("Archives a url with archive.today")
    .addStringOption(option =>
        option.setName("url")
            .setDescription("Url to archive")
            .setRequired(true)
    );

async function execute(interaction: ChatInputCommandInteraction) {
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

export const archivifyCommand = {
    cooldown,
    data,
    execute
};