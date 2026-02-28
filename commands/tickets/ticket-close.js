import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';

export default {
  category: 'tickets',
  data: new SlashCommandBuilder()
    .setName('ticket-close')
    .setDescription('Close the current ticket.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
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

    ticket.open = false;
    ticket.closedAt = Date.now();
    await saveGuildData(interaction.guild.id, data);

    await interaction.channel.setLocked(true, `Ticket closed by ${interaction.user.tag}`).catch(() => {});

    return interaction.reply({
      embeds: [createSuccessEmbed('Ticket closed. Use `/ticket-reopen` to reopen or `/ticket-delete` to delete.')]
    });
  }
};

