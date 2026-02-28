import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';

export default {
  category: 'tickets',
  data: new SlashCommandBuilder()
    .setName('ticket-add')
    .setDescription('Add a member to the current ticket.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addUserOption(o =>
      o.setName('user').setDescription('User to add.').setRequired(true)
    ),
  cooldown: 5,
  async execute(interaction) {
    const member = interaction.options.getMember('user');
    if (!member) {
      return interaction.reply({
        embeds: [createErrorEmbed('User not found in this server.')],
        ephemeral: true
      });
    }

    const data = await getGuildData(interaction.guild.id);
    const ticket = data.tickets.find(t => t.channelId === interaction.channel.id);
    if (!ticket) {
      return interaction.reply({
        embeds: [createErrorEmbed('This channel is not a ticket.')],
        ephemeral: true
      });
    }

    await interaction.channel.permissionOverwrites.edit(member.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true
    }, { reason: `Ticket add by ${interaction.user.tag}` });

    return interaction.reply({
      embeds: [createSuccessEmbed(`Added ${member} to this ticket.`)]
    });
  }
};

