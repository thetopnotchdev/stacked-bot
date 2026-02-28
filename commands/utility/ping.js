import { SlashCommandBuilder } from 'discord.js';
import { createInfoEmbed } from '../../utils/embedFactory.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency.'),
  cooldown: 3,
  async execute(interaction) {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    const diff = sent.createdTimestamp - interaction.createdTimestamp;
    const ws = interaction.client.ws.ping;
    await interaction.editReply({
      content: '',
      embeds: [createInfoEmbed(`WebSocket: \`${ws}ms\`\nRoundtrip: \`${diff}ms\``)]
    });
  }
};

