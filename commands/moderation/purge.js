import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';

export default {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete messages in this channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(o =>
      o.setName('amount').setDescription('Number of messages to delete (1-100)').setRequired(true)
    ),
  cooldown: 10,
  requiredClientPermissions: [PermissionFlagsBits.ManageMessages],
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    if (amount < 1 || amount > 100) {
      return interaction.reply({
        embeds: [createErrorEmbed('Amount must be between 1 and 100.')],
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });
    const deleted = await interaction.channel.bulkDelete(amount, true).catch(() => null);
    if (!deleted) {
      return interaction.editReply({
        embeds: [createErrorEmbed('Failed to purge messages. I may not have permission, or messages are too old.')]
      });
    }

    return interaction.editReply({
      embeds: [createSuccessEmbed(`Deleted \`${deleted.size}\` messages.`)]
    });
  }
};

