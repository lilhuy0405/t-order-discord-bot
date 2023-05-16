import { SlashCommandBuilder } from 'discord.js';
import FacebookVideoDownloaderService from '../services/FacebookVideoDownloaderService';

const fbDownloaderService = new FacebookVideoDownloaderService();
module.exports = {
    data: new SlashCommandBuilder()
        .setName('download-fb-video')
        .setDescription('Tải video từ facebook support facebook watch và facebook reel')
        .addStringOption(option =>
            option.setName('video-url')
                .setDescription('Link video facebook')),

    async execute(interaction: any) {
        try {
            await interaction.deferReply({ ephemeral: false });
            const videoUrl = interaction.options.getString('video-url');
            if(!videoUrl) {
                await interaction.editReply('Bạn chưa nhập link video');
                return;
            }
            const videoStream  = await fbDownloaderService.getVideoStream(videoUrl);
            await interaction.editReply({
                files: [{
                    attachment: videoStream,
                    name: `${new Date().getTime()}_fb_video.mp4`,
                }],

            });
        } catch (err) {
            console.log(err);
            await interaction.editReply('Bot lỗi rồi <@675329369987612682> vào sửa đi :<\nError: ' + err?.message);
        }
    },
};