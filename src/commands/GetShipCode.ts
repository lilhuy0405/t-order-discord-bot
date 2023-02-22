import { SlashCommandBuilder } from 'discord.js';

import Excel = require('exceljs');
const getShipCode = async (interaction: any) => {
    try {

        const phone = interaction.options.getString('phone');
        if (!phone) {
            throw new Error('Phone number is required');
        }

        const workbook = new Excel.Workbook();
        await workbook.xlsx.readFile('./data.xlsx')
        const worksheet = workbook.getWorksheet("Sheet0");
        const listShipCode = [];
        worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {

            if (rowNumber > 1) {
                const shipCode = row.values[1];
                const user = row.values[2];
                const product = row.values[4];
                const phoneInExcel = row.values[5];
                if (phone === phoneInExcel) {
                    listShipCode.push({
                        shipCode,
                        user,
                        product,
                    });
                }
            }
        });
        if (listShipCode.length > 0) {
            const message = listShipCode.map((item) => {
                return `mvd: ${item.shipCode}, Người nhận: ${item.user}, Hàng order: ${item.product}`;
            }).join('\n');
            await interaction.reply(message);
        }
        else {
            await interaction.reply(`Không tìm thấy mvd nào`);
        }
    } catch (err) {
        await interaction.reply(`Error: ${err.message}`);
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