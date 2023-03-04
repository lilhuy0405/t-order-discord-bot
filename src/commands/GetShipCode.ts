import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import Excel = require('exceljs');
import { RequestInfo, RequestInit } from 'node-fetch';
import { getWebsiteContent } from '../util';
import { JSDOM } from 'jsdom';
const queryString = require('node:querystring');

const fetch = (url: RequestInfo, init?: RequestInit) =>
    import('node-fetch').then(({ default: fetch }) => fetch(url, init));


function isVietnamesePhoneNumber(number) {
    return /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/.test(number);
}

const getTrackingStatus = async (shipCode: string) => {
    const searchString = queryString.stringify({
        type: 'track',
        billcode: shipCode
    })
    try {
        const url = 'https://jtexpress.vn/vi/tracking?type=track&billcode=' + shipCode;
        const websiteHtml = await getWebsiteContent(url);


        if (!websiteHtml) {
            throw new Error('Empty website content');
        }
        const dom: JSDOM = new JSDOM(websiteHtml);
        const doc = dom.window.document;

        const resultVandonItems = doc.querySelectorAll('.result-vandon-item');
        let res = ''
        for (let i = 0; i < resultVandonItems.length - 1; i++) {
            //get firt div
            const firstDiv = resultVandonItems[i].querySelector('div');
            const firstDivSpans = firstDiv.querySelectorAll('span');
            const firstDivSpan1 = firstDivSpans[0];
            const firstDivSpan2 = firstDivSpans[1];
            const trackingItemTime = firstDivSpan1.textContent.trim();
            const trackingItemDate = firstDivSpan2.textContent.trim();
            //get second div
            const trackingItemContent = resultVandonItems[i].querySelectorAll('div')[3].textContent.trim()
            res += `⏰ **${trackingItemDate} ${trackingItemTime}:** 🚒 ${trackingItemContent}\n`
        }
        return res;

    } catch (e) {
        console.log(e);
        return `Lấy trạng thái đơn thất bại. Dùng tạm link: https://jtexpress.vn/vi/tracking?${searchString} vậy xin lỗi vì bot phèn :<`;
    }
}

const getPaginateButton = (page: number, maxPage: number) => {
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('previous_embed')
                .setEmoji('⏮')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 0)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('current_embed')
                .setLabel(`Trang: ${page + 1}/${maxPage}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('next_embed')
                .setEmoji('⏭')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === maxPage - 1)

        );
    return row;
}

const getShipCode = async (interaction: any) => {
    try {
        const apiURL = 'https://torder-api.click/orders/';
        const phone = interaction.options.getString('phone');
        if (!phone) throw new Error('Vui lòng nhập số điện thoại');
        // if (!isVietnamesePhoneNumber(phone)) throw new Error('Số điện thoại không hợp lệ');
        const resp = await fetch(apiURL + phone);
        if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
        const data = await resp.json();
        const listOrders = data.data;
        if (!listOrders.length) {
            await interaction.reply('Không tìm thấy mvd nào. Mua gì đi rồi mình nói chuyện tiếp');
            return;
        }
        //from list orders build list embeds
        const listEmbeds = await Promise.all(listOrders.map(async (order: any, i: number) => {
            let description = '';
            const trackingStatus = await getTrackingStatus(order.shipCode);
            description += `**${i + 1}. MVD: ${order.shipCode}** | Tên người nhận: ${order.customerName} | Hàng: ${order.product}`
            description += `\n`.concat(trackingStatus);
            return {
                color: 0x0099ff,
                title: 'Danh sách mvd của ' + listOrders[0].customerName,
                author: {
                    name: '65% bot',
                    icon_url: 'https://ichef.bbci.co.uk/news/976/cpsprodpb/16620/production/_91408619_55df76d5-2245-41c1-8031-07a4da3f313f.jpg',
                },

                description,
                footer: {
                    text: 'Bot created by lilhuy',
                    icon_url: 'https://res.cloudinary.com/dfpf4gsti/image/upload/v1677298052/me_h2dzlt.jpg',
                },
            };
        }));
        let currentEmbedIndex = 0;

        //handle button click
        const filter = (i: any) => i.customId === 'next_embed' || i.customId === 'previous_embed';
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 5 * 60 * 1000 });
        collector.on('collect', async (i: any) => {
            if (i.customId === 'next_embed') {
                currentEmbedIndex++;
            } else if (i.customId === 'previous_embed') {
                currentEmbedIndex--;
            }
            await i.update({ embeds: [listEmbeds[currentEmbedIndex]], components: [getPaginateButton(currentEmbedIndex, listEmbeds.length)] });

        });

        await interaction.reply({ embeds: [listEmbeds[0]], components: [getPaginateButton(currentEmbedIndex, listEmbeds.length)] });


    } catch (err) {
        await interaction.reply(`Lỗi: ${err.message}`);
    }
}
module.exports = {
    data: new SlashCommandBuilder()
        .setName('mvd')
        .setDescription('Tìm mvd theo số điện thoại')
        .addStringOption(option =>
            option.setName('phone')
                .setDescription('Số điện thoại')),
    async execute(interaction: any) {
        await getShipCode(interaction)
    },
};