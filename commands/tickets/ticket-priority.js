import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';

export default {
  category: 'tickets',
  data: new SlashCommandBuilder()
    .setName('ticket-priority')
    .setDescription('Set the priority of the current ticket.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(o =>
      o.setName('level')
        .setDescription('Priority level.')
        .addChoices(
          { name: 'Low', value: 'low' },
          { name: 'Normal', value: 'normal' },
          { name: 'High', value: 'high' }
        )
        .setRequired(true)
    ),
  cooldown: 5,
  async execute(interaction) {
    const level = interaction.options.getString('level');
    const data = await getGuildData(interaction.guild.id);
    const ticket = data.tickets.find(t => t.channelId === interaction.channel.id);
    if (!ticket) {
      return interaction.reply({
        embeds: [createErrorEmbed('This channel is not a ticket.')],
        ephemeral: true
      });
    }

    ticket.priority = level;
    await saveGuildData(interaction.guild.id, data);

    return interaction.reply({
      embeds: [createSuccessEmbed(`Ticket priority set to **${level}**.`)]
    });
  }
};

