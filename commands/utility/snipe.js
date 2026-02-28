import { SlashCommandBuilder } from 'discord.js';
import { createInfoEmbed, createErrorEmbed } from '../../utils/embedFactory.js';
import { getGuildData } from '../../utils/dataStore.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('snipe')
    .setDescription('View the last deleted message in this channel.'),
  cooldown: 5,
  async execute(interaction) {
    const data = await getGuildData(interaction.guild.id);
    const entry = data.snipe[interaction.channel.id];
    if (!entry) {
      return interaction.reply({
        embeds: [createErrorEmbed('Nothing to snipe in this channel.')],
        ephemeral: true
      });
    }
    return interaction.reply({
      embeds: [
        createInfoEmbed(`**Last deleted message:**\n${entry.content ?? '*no content*'}`)
          .setFooter({ text: `Author: ${entry.authorId}` })
      ]
    });
  }
};

