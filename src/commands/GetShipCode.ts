import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import Excel = require('exceljs');
import { RequestInfo, RequestInit } from 'node-fetch';
import { getWebsiteContent } from '../util';
import { JSDOM } from 'jsdom';
import { sleep } from '../util/index';
const queryString = require('node:querystring');
const { Pagination } = require('pagination.djs');


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
        if (res.length === 0) {
            res = `Không lấy được trạng thái đơn hàng từ J&T :<
             Có thể do đơn mới tạo nên JT chưa cập nhập dữ liệu
             Tra cứu trực tiếp tại đây: https://jtexpress.vn/vi/tracking?type=track&billcode=${shipCode}`
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
        await interaction.deferReply();
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
            return new EmbedBuilder()
                .setTitle('Danh sách mvd của ' + listOrders[0].customerName)
                .setColor(0x0099ff)
                .setDescription(description)

            // return {
            //     color: 0x0099ff,
            //     title: 'Danh sách mvd của ' + listOrders[0].customerName,
            //     author: {
            //         name: '65% bot',
            //         icon_url: 'https://ichef.bbci.co.uk/news/976/cpsprodpb/16620/production/_91408619_55df76d5-2245-41c1-8031-07a4da3f313f.jpg',
            //     },

            //     description
            // };
        }));
        if (!listEmbeds.length) {
            await interaction.reply('Không tìm thấy mvd nào. Mua gì đi rồi mình nói chuyện tiếp');
            return;
        }
        const pagination = new Pagination(interaction);
        pagination.setEmbeds(listEmbeds);

        pagination.setEmbeds(listEmbeds, (embed: EmbedBuilder) => {
            return embed.setFooter({
                text: 'Bot created by lilhuy',
                iconURL: 'https://res.cloudinary.com/dfpf4gsti/image/upload/v1677298052/me_h2dzlt.jpg',
            }
            ).setAuthor({
                name: '65% bot',
                iconURL: 'https://ichef.bbci.co.uk/news/976/cpsprodpb/16620/production/_91408619_55df76d5-2245-41c1-8031-07a4da3f313f.jpg',
            });
        });
        pagination.render();

    } catch (err) {
        await interaction.editReply(`Bot lỗi rồi @lilhuy vào sửa đi :< ${err?.message}`);
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