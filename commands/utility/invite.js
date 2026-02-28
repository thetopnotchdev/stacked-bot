import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createInfoEmbed, createErrorEmbed } from '../../utils/embedFactory.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Create an invite for this channel.'),
  cooldown: 10,
  requiredClientPermissions: [PermissionFlagsBits.CreateInstantInvite],
  async execute(interaction) {
    if (!interaction.channel.isTextBased()) {
      return interaction.reply({ embeds: [createErrorEmbed('Use this in a text channel.')], ephemeral: true });
    }
    const invite = await interaction.channel.createInvite({
      maxAge: 3600,
      maxUses: 5,
      reason: `Requested by ${interaction.user.tag}`
    }).catch(() => null);
    if (!invite) {
      return interaction.reply({ embeds: [createErrorEmbed('Failed to create invite.')], ephemeral: true });
    }
    return interaction.reply({
      embeds: [createInfoEmbed(`Invite created: ${invite.url}`)]
    });
  }
};

