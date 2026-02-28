import { SlashCommandBuilder } from 'discord.js';
import { createInfoEmbed } from '../../utils/embedFactory.js';
import { formatDuration } from '../../utils/time.js';

export default {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Show bot uptime.'),
  cooldown: 5,
  async execute(interaction) {
    const uptime = interaction.client.uptime ?? 0;
    return interaction.reply({
      embeds: [createInfoEmbed(`Uptime: \`${formatDuration(uptime)}\``)]
    });
  }
};

