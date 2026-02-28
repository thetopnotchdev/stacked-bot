import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { createCase, ensureModPermissions } from '../../utils/moderation.js';

export default {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o =>
      o.setName('user').setDescription('User to warn.').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('reason').setDescription('Reason for the warning.')
    ),
  cooldown: 5,
  requiredClientPermissions: [PermissionFlagsBits.SendMessages],
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

    const entry = await createCase(interaction.guild, {
      userId: target.id,
      moderatorId: interaction.user.id,
      type: 'WARN',
      reason
    });

    await target.send({
      embeds: [createErrorEmbed(`You have received a warning in **${interaction.guild.name}**.\nReason: ${reason}`)]
    }).catch(() => {});

    return interaction.reply({
      embeds: [createSuccessEmbed(`Warned ${target.user.tag}. Case #${entry.id}.`)]
    });
  }
};

