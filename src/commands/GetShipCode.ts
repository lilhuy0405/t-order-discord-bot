import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import Excel = require('exceljs');
import { RequestInfo, RequestInit } from 'node-fetch';
const fetch = (url: RequestInfo, init?: RequestInit) =>
    import('node-fetch').then(({ default: fetch }) => fetch(url, init));


function isVietnamesePhoneNumber(number) {
    return /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/.test(number);
}

const getShipCode = async (interaction: any) => {
    try {
        const apiURL = 'https://torder-api.click/orders/';
        const phone = interaction.options.getString('phone');
        if(!phone) throw new Error('Vui lòng nhập số điện thoại');
        if (!isVietnamesePhoneNumber(phone)) throw new Error('Số điện thoại không hợp lệ');
        const resp = await fetch(apiURL + phone);
        if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
        const data = await resp.json();
        const listOrders = data.data;
        if (!listOrders.length) throw new Error('Không tìm thấy mvd nào !. Mua gì đi rồi chúng ta nói chuyện tiếp');
        let listOrderMsg = listOrders.map((order: any, index: number) => {
            return `${index + 1}. MVD: ${order.shipCode} | Tên người nhận: ${order.customerName} | Hàng: ${order.product}`

        }).join('\n');
        listOrderMsg += `\n\nTổng cộng: ${listOrders.length} mvd. Tra cứu vận đơn tại: https://jtexpress.vn/vi/tracking?type=track`;

        const responseEmbeded = {
            color: 0x0099ff,
            title: 'Danh sách mvd của ' + listOrders[0].customerName,
            author: {
                name: '65% bot',
                icon_url: 'https://ichef.bbci.co.uk/news/976/cpsprodpb/16620/production/_91408619_55df76d5-2245-41c1-8031-07a4da3f313f.jpg',
            },

            description: listOrderMsg,
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