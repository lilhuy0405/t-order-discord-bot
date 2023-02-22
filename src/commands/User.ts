import { SlashCommandBuilder } from 'discord.js';
import moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Provides information about the user.'),
    async execute(interaction: any) {

        moment.locale("vi");
        const joinTime = moment(interaction.member.joinedAt).format("LLLL");
        await interaction.reply(`Con nghiện ${interaction.user.username} vào trại nghiện từ ${joinTime}.`);
    },
};
