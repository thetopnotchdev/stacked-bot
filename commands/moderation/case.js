import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createInfoEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';

export default {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('case')
    .setDescription('View or delete a moderation case.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand(sub =>
      sub.setName('view')
        .setDescription('View details of a case.')
        .addIntegerOption(o =>
          o.setName('id').setDescription('Case ID.').setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('delete')
        .setDescription('Delete a case from records.')
        .addIntegerOption(o =>
          o.setName('id').setDescription('Case ID.').setRequired(true)
        )
    ),
  cooldown: 5,
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const id = interaction.options.getInteger('id');
    const data = await getGuildData(interaction.guild.id);
    const entry = data.cases.find(c => c.id === id);

    if (!entry) {
      return interaction.reply({
        embeds: [createErrorEmbed('Case not found.')],
        ephemeral: true
      });
    }

    if (sub === 'view') {
      const embed = createInfoEmbed(
        `**Case #${entry.id}** - ${entry.type}\n` +
        `User: <@${entry.userId}> (${entry.userId})\n` +
        `Moderator: <@${entry.moderatorId}> (${entry.moderatorId})\n` +
        `Reason: ${entry.reason}\n` +
        `Created: <t:${Math.floor(entry.createdAt / 1000)}:F>` +
        (entry.expiresAt ? `\nExpires: <t:${Math.floor(entry.expiresAt / 1000)}:F>` : '')
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === 'delete') {
      data.cases = data.cases.filter(c => c.id !== id);
      await saveGuildData(interaction.guild.id, data);
      return interaction.reply({
        embeds: [createSuccessEmbed(`Case #${id} has been deleted.`)],
        ephemeral: true
      });
    }
  }
};

