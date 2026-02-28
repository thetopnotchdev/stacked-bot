import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData } from '../../utils/dataStore.js';

export default {
  category: 'tickets',
  data: new SlashCommandBuilder()
    .setName('ticket-rename')
    .setDescription('Rename the current ticket channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption(o =>
      o.setName('name').setDescription('New channel name.').setRequired(true)
    ),
  cooldown: 5,
  async execute(interaction) {
    const name = interaction.options.getString('name');

    const data = await getGuildData(interaction.guild.id);
    const ticket = data.tickets.find(t => t.channelId === interaction.channel.id);
    if (!ticket) {
      return interaction.reply({
        embeds: [createErrorEmbed('This channel is not a ticket.')],
        ephemeral: true
      });
    }

    await interaction.channel.setName(name, `Ticket renamed by ${interaction.user.tag}`).catch(() => {});

    return interaction.reply({
      embeds: [createSuccessEmbed(`Ticket renamed to **${name}**.`)]
    });
  }
};

