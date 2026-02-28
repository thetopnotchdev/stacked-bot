import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { createCase, canModerate, ensureModPermissions, parseTimeoutDuration } from '../../utils/moderation.js';

export default {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(o =>
      o.setName('user').setDescription('User to ban.').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('reason').setDescription('Reason for the ban.')
    )
    .addStringOption(o =>
      o.setName('duration').setDescription('Optional temp ban duration (e.g. 1d, 6h).')
    ),
  cooldown: 5,
  requiredClientPermissions: [PermissionFlagsBits.BanMembers],
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') ?? 'No reason provided';
    const durationInput = interaction.options.getString('duration');

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
    if (!interaction.guild.members.me.bannable || !target.bannable) {
      return interaction.reply({
        embeds: [createErrorEmbed('I cannot ban this member. Check my role position.')],
        ephemeral: true
      });
    }

    let expiresAt = null;
    if (durationInput) {
      const ms = parseTimeoutDuration(durationInput);
      if (!ms) {
        return interaction.reply({
          embeds: [createErrorEmbed('Invalid duration. Use formats like `30m`, `2h`, `1d`.')],
          ephemeral: true
        });
      }
      expiresAt = Date.now() + ms;
    }

    await interaction.deferReply({ ephemeral: true });

    await target.send({
      embeds: [createErrorEmbed(`You have been banned from **${interaction.guild.name}**.\nReason: ${reason}`)]
    }).catch(() => {});

    await interaction.guild.members.ban(target, { reason }).catch(err => {
      throw err;
    });

    const entry = await createCase(interaction.guild, {
      userId: target.id,
      moderatorId: interaction.user.id,
      type: expiresAt ? 'TEMP_BAN' : 'BAN',
      reason,
      expiresAt
    });

    return interaction.editReply({
      embeds: [createSuccessEmbed(`Banned ${target.user.tag}. Case #${entry.id}.`)]
    });
  }
};

