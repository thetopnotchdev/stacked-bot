import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';

export default {
  category: 'tickets',
  data: new SlashCommandBuilder()
    .setName('ticket-unclaim')
    .setDescription('Unclaim the current ticket.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  cooldown: 5,
  async execute(interaction) {
    const data = await getGuildData(interaction.guild.id);
    const ticket = data.tickets.find(t => t.channelId === interaction.channel.id);
    if (!ticket || !ticket.open) {
      return interaction.reply({
        embeds: [createErrorEmbed('This channel is not an open ticket.')],
        ephemeral: true
      });
    }
    if (!ticket.claimedBy) {
      return interaction.reply({
        embeds: [createErrorEmbed('This ticket is not claimed.')],
        ephemeral: true
      });
    }

    ticket.claimedBy = null;
    await saveGuildData(interaction.guild.id, data);

    return interaction.reply({
      embeds: [createSuccessEmbed('Ticket has been unclaimed.')]
    });
  }
};

