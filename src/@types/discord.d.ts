import { Collection } from "discord.js";
import type { ArchivifyCommand } from "./archivifyCommand.js";

declare module "discord.js" {
    export interface Client {
        commands: Collection<string, ArchivifyCommand>;
        cooldowns: Collection<string, Collection<string, number>>;
    }
}