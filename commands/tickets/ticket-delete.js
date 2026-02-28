import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';

export default {
  category: 'tickets',
  data: new SlashCommandBuilder()
    .setName('ticket-delete')
    .setDescription('Delete the current ticket channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  cooldown: 5,
  async execute(interaction) {
    const data = await getGuildData(interaction.guild.id);
    const ticket = data.tickets.find(t => t.channelId === interaction.channel.id);
    if (!ticket) {
      return interaction.reply({
        embeds: [createErrorEmbed('This channel is not a ticket.')],
        ephemeral: true
      });
    }

    ticket.deletedAt = Date.now();
    await saveGuildData(interaction.guild.id, data);

    await interaction.reply({
      embeds: [createSuccessEmbed('Ticket channel will be deleted in 5 seconds.')]
    });

    setTimeout(() => {
      interaction.channel.delete(`Ticket deleted by ${interaction.user.tag}`).catch(() => {});
    }, 5000);
  }
};

