import { SlashCommandBuilder } from 'discord.js';
import NewsCrawler from '../services/NewsCrawler';
import moment = require('moment');

const crawler = new NewsCrawler();
module.exports = {
    data: new SlashCommandBuilder()
        .setName('vnexpress')
        .setDescription('Tin tức mới nhất từ vnexpress.net'),
    async execute(interaction: any) {
        const news = await crawler.getLatestNews();
        if (!news) {
            await interaction.reply('Đã xảy ra lỗi khi lấy tin tức');
            return;
        }

        const listNewsMsg = news.map((news: any, index: number) => {
            return `${index + 1}. ${news[0]} | ${news[1]}`
        }).join('\n');
        moment.locale("vi");
        const today = moment().format("LLLL");
        const responseEmbeded = {
            color: 0x0099ff,
            title: 'tin tức ngày: ' + today,
            author: {
                name: '65% bot',
                icon_url: 'https://ichef.bbci.co.uk/news/976/cpsprodpb/16620/production/_91408619_55df76d5-2245-41c1-8031-07a4da3f313f.jpg',
            },

            description: listNewsMsg,
            footer: {
                text: 'Bot created by lilhuy',
                icon_url: 'https://res.cloudinary.com/dfpf4gsti/image/upload/v1677298052/me_h2dzlt.jpg',
            },

        };
        await interaction.reply({ embeds: [responseEmbeded] });
    },
};