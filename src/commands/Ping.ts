import { SlashCommandBuilder } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('sống hay chết chỉ anh mới biết :v'),
    async execute(interaction: any) {
        const healthCheckMsgs = [`Tao vẫn sống`, `Gọi cc`, `Sủa lên`, `Đang ngủ`, `Pong`, `Gọi ít thôi`, '65% is the best', 'dme wibu', 'anh Huy dz'];
        const randomIndex = Math.floor(Math.random() * healthCheckMsgs.length);
        await interaction.reply(healthCheckMsgs[randomIndex]);
    },
};