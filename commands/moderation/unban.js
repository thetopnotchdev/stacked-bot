import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { createCase } from '../../utils/moderation.js';

export default {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user by ID.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(o =>
      o.setName('userid').setDescription('ID of the user to unban.').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('reason').setDescription('Reason for the unban.')
    ),
  cooldown: 5,
  requiredClientPermissions: [PermissionFlagsBits.BanMembers],
  async execute(interaction) {
    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') ?? 'No reason provided';

    const bans = await interaction.guild.bans.fetch().catch(() => null);
    if (!bans || !bans.has(userId)) {
      return interaction.reply({
        embeds: [createErrorEmbed('That user is not banned or the ID is invalid.')],
        ephemeral: true
      });
    }

    const banInfo = bans.get(userId);

    await interaction.guild.members.unban(userId, reason).catch(err => {
      throw err;
    });

    const entry = await createCase(interaction.guild, {
      userId,
      moderatorId: interaction.user.id,
      type: 'UNBAN',
      reason
    });

    return interaction.reply({
      embeds: [createSuccessEmbed(`Unbanned ${banInfo.user.tag}. Case #${entry.id}.`)]
    });
  }
};

