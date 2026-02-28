import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createSuccessEmbed } from '../../utils/embedFactory.js';
import { removeSticky } from '../../utils/stickyMessages.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('unsticky')
    .setDescription('Remove sticky message from this channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  cooldown: 10,
  async execute(interaction) {
    await removeSticky(interaction.guild.id, interaction.channel.id);
    return interaction.reply({
      embeds: [createSuccessEmbed('Sticky message removed from this channel.')]
    });
  }
};

