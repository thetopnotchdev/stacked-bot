import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { createCase } from '../../utils/moderation.js';

export default {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('Remove timeout from a member.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o =>
      o.setName('user').setDescription('User to untimeout.').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('reason').setDescription('Reason for removing the timeout.')
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
      type: 'UN_TIMEOUT',
      reason
    });

    return interaction.reply({
      embeds: [createSuccessEmbed(`Removed timeout from ${target.user.tag}. Case #${entry.id}.`)]
    });
  }
};

