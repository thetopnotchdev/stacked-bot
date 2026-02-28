import { SlashCommandBuilder } from 'discord.js';
import { createInfoEmbed, createErrorEmbed } from '../../utils/embedFactory.js';
import { getGuildData } from '../../utils/dataStore.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('editsnipe')
    .setDescription('View the last edited message in this channel.'),
  cooldown: 5,
  async execute(interaction) {
    const data = await getGuildData(interaction.guild.id);
    const entry = data.snipe[`edit_${interaction.channel.id}`];
    if (!entry) {
      return interaction.reply({
        embeds: [createErrorEmbed('Nothing to editsnipe in this channel.')],
        ephemeral: true
      });
    }
    return interaction.reply({
      embeds: [
        createInfoEmbed(
          `**Before:**\n${entry.oldContent ?? '*no content*'}\n\n**After:**\n${entry.newContent ?? '*no content*'}`
        ).setFooter({ text: `Author: ${entry.authorId}` })
      ]
    });
  }
};

