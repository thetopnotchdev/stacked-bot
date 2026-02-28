import { SlashCommandBuilder } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData } from '../../utils/dataStore.js';
import { createSuggestion } from '../../utils/suggestions.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Create a server suggestion.')
    .addStringOption(o =>
      o.setName('text').setDescription('Your suggestion.').setRequired(true)
    ),
  cooldown: 15,
  async execute(interaction) {
    const text = interaction.options.getString('text');
    const data = await getGuildData(interaction.guild.id);
    const channelId = data.suggestions.channelId;
    if (!channelId) {
      return interaction.reply({
        embeds: [createErrorEmbed('Suggestion channel is not configured.')],
        ephemeral: true
      });
    }
    const channel = interaction.guild.channels.cache.get(channelId);
    if (!channel?.isTextBased()) {
      return interaction.reply({
        embeds: [createErrorEmbed('Suggestion channel no longer exists.')],
        ephemeral: true
      });
    }

    const suggestion = await createSuggestion(interaction.guild.id, {
      userId: interaction.user.id,
      text
    });

    const msg = await channel.send({
      embeds: [createSuccessEmbed(`Suggestion #${suggestion.id} from ${interaction.user}:\n${text}`)]
    });

    suggestion.messageId = msg.id;

    const all = await getGuildData(interaction.guild.id);
    const record = all.suggestionsStore.find(s => s.id === suggestion.id);
    if (record) record.messageId = msg.id;
    await (await import('../../utils/dataStore.js')).saveGuildData(interaction.guild.id, all);

    return interaction.reply({
      embeds: [createSuccessEmbed(`Suggestion submitted as #${suggestion.id}.`)],
      ephemeral: true
    });
  }
};

