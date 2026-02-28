import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData } from '../../utils/dataStore.js';

export default {
  category: 'giveaway',
  data: new SlashCommandBuilder()
    .setName('giveaway-forcepick')
    .setDescription('Force pick a winner from a giveaway.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o =>
      o.setName('messageid').setDescription('Message ID of the giveaway.').setRequired(true)
    ),
  cooldown: 5,
  async execute(interaction) {
    const messageId = interaction.options.getString('messageid');
    const data = await getGuildData(interaction.guild.id);
    const g = data.giveaways.find(x => x.messageId === messageId);
    if (!g) {
      return interaction.reply({
        embeds: [createErrorEmbed('Giveaway not found for that message ID.')],
        ephemeral: true
      });
    }

    const channel = interaction.guild.channels.cache.get(g.channelId);
    if (!channel?.isTextBased()) {
      return interaction.reply({
        embeds: [createErrorEmbed('Giveaway channel no longer exists.')],
        ephemeral: true
      });
    }

    const msg = await channel.messages.fetch(messageId).catch(() => null);
    if (!msg) {
      return interaction.reply({
        embeds: [createErrorEmbed('Giveaway message no longer exists.')],
        ephemeral: true
      });
    }

    const reactions = msg.reactions.resolve('🎉');
    const users = reactions ? await reactions.users.fetch() : null;
    const entrants = users
      ? users.filter(u => !u.bot).map(u => interaction.guild.members.cache.get(u.id)).filter(Boolean)
      : [];

    if (entrants.length === 0) {
      return interaction.reply({
        embeds: [createErrorEmbed('No entrants to pick from.')],
        ephemeral: true
      });
    }

    const winner = entrants[Math.floor(Math.random() * entrants.length)];

    return interaction.reply({
      content: `<@${winner.id}>`,
      embeds: [createSuccessEmbed(`Forced winner picked for **${g.prize}**: ${winner}`)]
    });
  }
};

