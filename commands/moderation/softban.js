import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { createCase, canModerate, ensureModPermissions } from '../../utils/moderation.js';

export default {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('softban')
    .setDescription('Softban a member (ban then unban to clear messages).')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(o =>
      o.setName('user').setDescription('User to softban.').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('reason').setDescription('Reason for the softban.')
    )
    .addIntegerOption(o =>
      o.setName('days')
        .setDescription('Days of messages to delete (0-7).')
        .setMinValue(0)
        .setMaxValue(7)
    ),
  cooldown: 5,
  requiredClientPermissions: [PermissionFlagsBits.BanMembers],
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') ?? 'No reason provided';
    const days = interaction.options.getInteger('days') ?? 1;

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
    if (!target.bannable) {
      return interaction.reply({
        embeds: [createErrorEmbed('I cannot ban this member. Check my role position.')],
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    await interaction.guild.members.ban(target, {
      reason: `Softban: ${reason}`,
      deleteMessageDays: days
    }).catch(err => {
      throw err;
    });

    await interaction.guild.members.unban(target.id, 'Softban unban step.').catch(() => {});

    const entry = await createCase(interaction.guild, {
      userId: target.id,
      moderatorId: interaction.user.id,
      type: 'SOFTBAN',
      reason
    });

    return interaction.editReply({
      embeds: [createSuccessEmbed(`Softbanned ${target.user.tag}. Case #${entry.id}.`)]
    });
  }
};

