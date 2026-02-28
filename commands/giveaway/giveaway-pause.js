import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';

export default {
  category: 'giveaway',
  data: new SlashCommandBuilder()
    .setName('giveaway-pause')
    .setDescription('Pause an active giveaway.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o =>
      o.setName('messageid').setDescription('Message ID of the giveaway.').setRequired(true)
    ),
  cooldown: 5,
  async execute(interaction) {
    const messageId = interaction.options.getString('messageid');
    const data = await getGuildData(interaction.guild.id);
    const g = data.giveaways.find(x => x.messageId === messageId);
    if (!g) {
      return interaction.reply({
        embeds: [createErrorEmbed('Giveaway not found for that message ID.')],
        ephemeral: true
      });
    }
    if (g.paused) {
      return interaction.reply({
        embeds: [createErrorEmbed('That giveaway is already paused.')],
        ephemeral: true
      });
    }
    g.paused = true;
    g.pausedAt = Date.now();
    await saveGuildData(interaction.guild.id, data);

    return interaction.reply({
      embeds: [createSuccessEmbed('Giveaway paused.')]
    });
  }
};

