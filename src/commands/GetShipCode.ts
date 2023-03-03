import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
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
        const url = 'https://jtexpress.vn/vi/tracking?type=track&billcode=841189925424';
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

        
        
        let listOrderMsg = await Promise.all(listOrders.map(async (order: any, i) => {
            const contentItem = `**${i + 1}. MVD: ${order.shipCode}** | Tên người nhận: ${order.customerName} | Hàng: ${order.product}`
            const trackingStatus = await getTrackingStatus(order.shipCode);
         
            
            return contentItem.concat(`\n`).concat(trackingStatus);
        }));
        let msg = listOrderMsg.join('\n');


        const orderShipCodeQuery = listOrders.map((order: any) => {
            return order.shipCode;
        }).join(',');

        const searchString = queryString.stringify({
            type: 'track',
            billcode: orderShipCodeQuery
        })


        msg += `\n\nTổng cộng: ${listOrders.length} mvd. Tra cứu vận đơn tại: https://jtexpress.vn/vi/tracking?${searchString}`;

        const responseEmbeded = {
            color: 0x0099ff,
            title: 'Danh sách mvd của ' + listOrders[0].customerName,
            author: {
                name: '65% bot',
                icon_url: 'https://ichef.bbci.co.uk/news/976/cpsprodpb/16620/production/_91408619_55df76d5-2245-41c1-8031-07a4da3f313f.jpg',
            },

            description: msg,
            footer: {
                text: 'Bot created by lilhuy',
                icon_url: 'https://res.cloudinary.com/dfpf4gsti/image/upload/v1677298052/me_h2dzlt.jpg',
            },

        };
        await interaction.reply({ embeds: [responseEmbeded] });


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