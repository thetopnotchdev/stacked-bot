import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';
import { updateSuggestionStatus } from '../../utils/suggestions.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('suggest-accept')
    .setDescription('Accept a suggestion by ID.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addIntegerOption(o =>
      o.setName('id').setDescription('Suggestion ID.').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('reason').setDescription('Optional note/reason.').setRequired(false)
    ),
  cooldown: 5,
  async execute(interaction) {
    const id = interaction.options.getInteger('id');
    const reason = interaction.options.getString('reason') ?? null;
    const updated = await updateSuggestionStatus(
      interaction.guild.id,
      id,
      'accepted',
      interaction.user.id,
      reason
    );
    if (!updated) {
      return interaction.reply({ embeds: [createErrorEmbed('Suggestion not found.')], ephemeral: true });
    }

    const data = await getGuildData(interaction.guild.id);
    if (updated.messageId && data.suggestions.channelId) {
      const ch = interaction.guild.channels.cache.get(data.suggestions.channelId);
      const msg = await ch?.messages.fetch(updated.messageId).catch(() => null);
      if (msg) {
        await msg.edit({
          embeds: [createSuccessEmbed(`Suggestion #${id} **ACCEPTED**.\n${updated.text}`)]
        }).catch(() => {});
      }
    }

    await saveGuildData(interaction.guild.id, data);

    return interaction.reply({
      embeds: [createSuccessEmbed(`Suggestion #${id} marked as accepted.`)]
    });
  }
};

