import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import Excel = require('exceljs');
import { RequestInfo, RequestInit } from 'node-fetch';
const fetch = (url: RequestInfo, init?: RequestInit) =>
    import('node-fetch').then(({ default: fetch }) => fetch(url, init));

const getShipCode = async (interaction: any) => {
    try {
        const apiURL = 'https://torder-api.click/orders/';
        const phone = interaction.options.getString('phone');
        const resp = await fetch(apiURL + phone);
        if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
        const data = await resp.json();
        const listOrders = data.data;
        if (!listOrders.length) throw new Error('Không tìm thấy đơn hàng nào với số điện thoại: ' + phone );
        const responseEmbeded = {
            color: 0x0099ff,
            title: 'Danh sách đơn hàng',
            description: 'Danh sách đơn hàng của ' + phone,
            fields: [
                {
                    name: 'MVD',
                    value: listOrders[0].shipCode,
                    inline: true,
                },
                {
                    name: 'người nhận',
                    value: listOrders[0].customerName,
                    inline: true,
                },
                {
                    name: 'hàng',
                    value: listOrders[0].product,
                    inline: true,
                },
            ],
        };
        for (let i = 1; i < listOrders.length; i++) {
            const order = listOrders[i];
            const rows = [
                {
                    name: '',
                    value: order.shipCode,
                    inline: true,
                },
                {
                    name: '',
                    value: order.customerName,
                    inline: true,
                },
                {
                    name: '',
                    value: order.product,
                    inline: true,
                }
            ]
            responseEmbeded.fields.push(...rows);
        }

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