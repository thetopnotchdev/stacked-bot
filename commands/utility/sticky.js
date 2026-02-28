import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createSuccessEmbed } from '../../utils/embedFactory.js';
import { setSticky } from '../../utils/stickyMessages.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('sticky')
    .setDescription('Set a sticky message for this channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(o =>
      o.setName('content').setDescription('Sticky message content.').setRequired(true)
    ),
  cooldown: 10,
  async execute(interaction) {
    const content = interaction.options.getString('content');
    await setSticky(interaction.guild.id, interaction.channel.id, content);
    return interaction.reply({
      embeds: [createSuccessEmbed('Sticky message set for this channel.')]
    });
  }
};

