import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { createCase, canModerate, ensureModPermissions } from '../../utils/moderation.js';

export default {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(o =>
      o.setName('user').setDescription('User to kick.').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('reason').setDescription('Reason for the kick.')
    ),
  cooldown: 5,
  requiredClientPermissions: [PermissionFlagsBits.KickMembers],
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') ?? 'No reason provided';

    if (!target) {
      return interaction.reply({
        embeds: [createErrorEmbed('User not found in this server.')],
        ephemeral: true
      });
    }
    if (!ensureModPermissions(interaction.member)) {
      return interaction.reply({
        embeds: [createErrorEmbed('You lack moderation permissions.')],
        ephemeral: true
      });
    }
    if (!canModerate(interaction.member, target)) {
      return interaction.reply({
        embeds: [createErrorEmbed('You cannot moderate this member due to role hierarchy.')],
        ephemeral: true
      });
    }
    if (!target.kickable) {
      return interaction.reply({
        embeds: [createErrorEmbed('I cannot kick this member. Check my role position.')],
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });
    await target.send({
      embeds: [createErrorEmbed(`You have been kicked from **${interaction.guild.name}**.\nReason: ${reason}`)]
    }).catch(() => {});

    await target.kick(reason);

    const entry = await createCase(interaction.guild, {
      userId: target.id,
      moderatorId: interaction.user.id,
      type: 'KICK',
      reason
    });

    return interaction.editReply({
      embeds: [createSuccessEmbed(`Kicked ${target.user.tag}. Case #${entry.id}.`)]
    });
  }
};

