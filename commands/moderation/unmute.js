import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { createCase } from '../../utils/moderation.js';

export default {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmute a member (remove timeout).')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o =>
      o.setName('user').setDescription('User to unmute.').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('reason').setDescription('Reason for unmuting.')
    ),
  cooldown: 5,
  requiredClientPermissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') ?? 'No reason provided';

    if (!target) {
      return interaction.reply({
        embeds: [createErrorEmbed('User not found in this server.')],
        ephemeral: true
      });
    }

    await target.timeout(null, reason).catch(err => {
      throw err;
    });

    const entry = await createCase(interaction.guild, {
      userId: target.id,
      moderatorId: interaction.user.id,
      type: 'UNMUTE',
      reason
    });

    return interaction.reply({
      embeds: [createSuccessEmbed(`Unmuted ${target.user.tag}. Case #${entry.id}.`)]
    });
  }
};

