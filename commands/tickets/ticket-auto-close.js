import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';

export default {
  category: 'tickets',
  data: new SlashCommandBuilder()
    .setName('ticket-auto-close')
    .setDescription('Configure automatic ticket close delay.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addIntegerOption(o =>
      o.setName('minutes')
        .setDescription('Minutes of inactivity before auto-close (0 to disable).')
        .setMinValue(0)
        .setRequired(true)
    ),
  cooldown: 5,
  async execute(interaction) {
    const minutes = interaction.options.getInteger('minutes');
    const data = await getGuildData(interaction.guild.id);
    if (!data.ticketConfig) data.ticketConfig = {};
    data.ticketConfig.autoCloseMinutes = minutes;
    await saveGuildData(interaction.guild.id, data);

    const text = minutes === 0
      ? 'Ticket auto-close disabled.'
      : `Tickets will auto-close after \`${minutes}\` minutes of inactivity.`;

    return interaction.reply({
      embeds: [createSuccessEmbed(text)]
    });
  }
};

