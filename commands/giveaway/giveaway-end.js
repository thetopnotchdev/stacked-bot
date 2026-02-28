import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData } from '../../utils/dataStore.js';
import { finishGiveaway } from '../../utils/giveaways.js';

export default {
  category: 'giveaway',
  data: new SlashCommandBuilder()
    .setName('giveaway-end')
    .setDescription('Force end a giveaway now.')
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

    await finishGiveaway(interaction.client, interaction.guild.id, messageId);

    return interaction.reply({
      embeds: [createSuccessEmbed('Giveaway ended.')]
    });
  }
};

