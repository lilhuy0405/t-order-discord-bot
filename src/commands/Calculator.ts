import { SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('calculator')
        .setDescription('Simple calculator if you need it :v')
        .addStringOption(option =>
            option.setName('expression')
                .setDescription('The expression you want to calculate')),
    async execute(interaction: any) {
        try {
            const expression = interaction.options.getString('expression');
            if (!expression) throw new Error('Please enter an expression');
            const res = eval(expression);
            await interaction.reply(`Em Huy quick math: ${expression} = ${res}`);
        } catch (e) {
            console.log(e);
            await interaction.reply("Invalid expression");
        }
    },
};