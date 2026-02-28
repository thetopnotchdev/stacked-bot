import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { createCase, canModerate, ensureModPermissions, parseTimeoutDuration } from '../../utils/moderation.js';

export default {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout (mute) a member for a duration.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o =>
      o.setName('user').setDescription('User to timeout.').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('duration').setDescription('Duration (e.g. 10m, 2h).').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('reason').setDescription('Reason for the timeout.')
    ),
  cooldown: 5,
  requiredClientPermissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const durationInput = interaction.options.getString('duration');
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

    const ms = parseTimeoutDuration(durationInput);
    if (!ms) {
      return interaction.reply({
        embeds: [createErrorEmbed('Invalid duration. Use between 1s and 28d (e.g. 10m, 2h, 1d).')],
        ephemeral: true
      });
    }

    await target.timeout(ms, reason).catch(err => {
      throw err;
    });

    const entry = await createCase(interaction.guild, {
      userId: target.id,
      moderatorId: interaction.user.id,
      type: 'TIMEOUT',
      reason,
      expiresAt: Date.now() + ms
    });

    return interaction.reply({
      embeds: [createSuccessEmbed(`Timed out ${target.user.tag} for \`${durationInput}\`. Case #${entry.id}.`)]
    });
  }
};

