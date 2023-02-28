import { SlashCommandBuilder } from 'discord.js';
import * as os from "os-utils";
import { convertBytesToGB, getCPUFreeAsync, getCPUUsageAsync } from '../util';
import checkDiskSpace from 'check-disk-space'
module.exports = {
    data: new SlashCommandBuilder()
        .setName('health')
        .setDescription('Tình trạng sức khỏe của bot'),
    async execute(interaction: any) {
        const cpuUsage = await getCPUUsageAsync();
        const cpuFree = await getCPUFreeAsync();
        let { free, size } = await checkDiskSpace('/');
        const usedPercents = Math.round((size - free) / size * 100);

        const message = `CPU đã bị húp: ${(cpuUsage * 100).toFixed(2)}%\n` +
            `CPU chưa dùng: ${(cpuFree * 100).toFixed(2)}%\n` +
            `Tổng Ram: ${(os.totalmem() / 1024).toFixed(2)} GB\n` +
            `Ram chưa bị húp: ${(os.freemem() / 1024).toFixed(2)} GB\n` +
            `Phần trăm ram bị húp: ${((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)}%\n` +
            `Còn ${convertBytesToGB(free).toFixed(2)} GB chưa bị húp trên tổng số ${convertBytesToGB(size).toFixed(2)} GB\n` +
            `=> Đã sử dụng ${usedPercents} % bộ nhớ\n` +
            `Platform: ${os.platform()}\n`;
        const finalMsg = "Tình trạng sức khỏe của tao:\n" + message;

        await interaction.reply(finalMsg);

    },
};

