import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import {RequestInfo, RequestInit} from 'node-fetch';
const fetch = (url: RequestInfo, init?: RequestInit) =>
  import('node-fetch').then(({default: fetch}) => fetch(url, init));
module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Random meme from reddit :D'),
    async execute(interaction: any) {
        try {
            const apiUrl = "https://meme-api.com/gimme/wholesomememes";
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const exampleEmbed = {
                title: data.title,
                image: {
                    url: data.url,
                },
                footer: {
                    text: 'Bot created by lilhuy',
                    icon_url: 'https://res.cloudinary.com/dfpf4gsti/image/upload/v1677298052/me_h2dzlt.jpg',
                },
            };
            await interaction.reply({ embeds: [exampleEmbed] });
        } catch (err) {
            console.log(err);
        }
    },
};