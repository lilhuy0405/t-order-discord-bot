import { SlashCommandBuilder } from 'discord.js';
import "dotenv/config";
import moment = require('moment');
import {RequestInfo, RequestInit} from 'node-fetch';
const fetch = (url: RequestInfo, init?: RequestInit) =>
  import('node-fetch').then(({default: fetch}) => fetch(url, init));

const getTrendingMvs = async (interaction: any) => {
    try {
        const url = "https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=VN&videoCategoryId=10&key=" + process.env.YOUTUBE_API_KEY;
        const response = await fetch(url);
        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const videos = data.items;
        const videoMsgs = videos.map((video: any, index: number) => {
            return `${index + 1}. ${video.snippet.title}  https://www.youtube.com/watch?v=${video.id}`
        }).join('\n');

        moment.locale("vi");
        const today = moment().format("LLLL");
        const responseEmbeded = {
            color: 0x0099ff,
            title: 'nhạc trending hôm nay: ' + today,
            author: {
                name: '65% bot',
                icon_url: 'https://ichef.bbci.co.uk/news/976/cpsprodpb/16620/production/_91408619_55df76d5-2245-41c1-8031-07a4da3f313f.jpg',
            },

            description: videoMsgs,
            footer: {
                text: 'Bot created by lilhuy',
                icon_url: 'https://res.cloudinary.com/dfpf4gsti/image/upload/v1677298052/me_h2dzlt.jpg',
            },

        };
        await interaction.reply({ embeds: [responseEmbeded] });
    } catch (e) {
        console.log(e);
        await interaction.reply("Có lỗi xảy ra: ", e.message);
    }
}
module.exports = {
    data: new SlashCommandBuilder()
        .setName('trending-musics')
        .setDescription('Get trending music from youtube :v'),
    async execute(interaction: any) {
        await getTrendingMvs(interaction);
    },
};