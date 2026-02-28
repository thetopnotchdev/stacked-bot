import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';

export default {
  category: 'tickets',
  data: new SlashCommandBuilder()
    .setName('ticket-limit')
    .setDescription('Set the maximum number of open tickets per user.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addIntegerOption(o =>
      o.setName('max')
        .setDescription('Maximum open tickets per user.')
        .setMinValue(1)
        .setMaxValue(50)
        .setRequired(true)
    ),
  cooldown: 5,
  async execute(interaction) {
    const max = interaction.options.getInteger('max');
    const data = await getGuildData(interaction.guild.id);
    if (!data.ticketConfig) data.ticketConfig = {};
    data.ticketConfig.maxTicketsPerUser = max;
    await saveGuildData(interaction.guild.id, data);

    return interaction.reply({
      embeds: [createSuccessEmbed(`Users can now have up to \`${max}\` open tickets.`)]
    });
  }
};

