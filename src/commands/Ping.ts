import { SlashCommandBuilder } from 'discord.js';
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('sống hay chết chỉ anh mới biết :v'),
    async execute(interaction: any) {
        const healthCheckMsgs = [`Tao vẫn sống`, `Gọi cc`, `Sủa lên`, `Đang ngủ`, `Pong`, `Gọi ít thôi`, '65% is the best', 'dme wibu', 'anh Huy dz'];
        const randomIndex = Math.floor(Math.random() * healthCheckMsgs.length);
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        interaction.editReply(`${healthCheckMsgs[randomIndex]} \n Current ping: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
    },
};