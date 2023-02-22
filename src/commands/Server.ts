import { SlashCommandBuilder } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Provides information about the server.'),
    async execute(interaction: any) {
        await interaction.reply(`Server ${interaction.guild.name} có ${interaction.guild.memberCount} con nghiện`);
    },
};