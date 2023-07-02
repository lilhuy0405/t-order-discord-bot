import 'dotenv/config'
import {Collection, Client as DiscordClient, Events, GatewayIntentBits} from 'discord.js'
import path = require('node:path');
import fs = require('node:fs');
import {keywords} from "./keywords";

async function main() {
  //these line belows should be in a .env file

  const client = new DiscordClient({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ]
  }) as any;

  //these line above should be in a .env file

  client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
  });


  client.commands = new Collection();


  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }

  client.on(Events.InteractionCreate, async (interaction: any) => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
    }
  });
  //keyword bots
  client.on(Events.MessageCreate, async (message: any) => {
    const isBot = message.author.bot;
    if (isBot) return;
    const messageContent = message.content.toLowerCase();
    const reply = keywords.find(keyword => {
      return keyword.matches.some(match => messageContent.includes(match));
    });
    if (reply) {
      await message.reply(reply.reply);
    }
  });

  // Log in to Discord with your client's token
  await client.login(process.env.TOKEN);

}

main().then();
