import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';

export default {
  category: 'tickets',
  data: new SlashCommandBuilder()
    .setName('ticket-setup')
    .setDescription('Configure basic ticket system settings.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(o =>
      o.setName('category')
        .setDescription('Category where tickets will be created.')
        .addChannelTypes(ChannelType.GuildCategory)
    )
    .addIntegerOption(o =>
      o.setName('max')
        .setDescription('Max tickets per user.')
        .setMinValue(1)
        .setMaxValue(50)
    )
    .addIntegerOption(o =>
      o.setName('autoclose')
        .setDescription('Auto close after X minutes of inactivity.')
        .setMinValue(5)
    ),
  cooldown: 10,
  async execute(interaction) {
    const category = interaction.options.getChannel('category');
    const max = interaction.options.getInteger('max');
    const auto = interaction.options.getInteger('autoclose');

    const data = await getGuildData(interaction.guild.id);
    if (!data.ticketConfig) data.ticketConfig = {};

    if (category) data.ticketConfig.categoryId = category.id;
    if (typeof max === 'number') data.ticketConfig.maxTicketsPerUser = max;
    if (typeof auto === 'number') data.ticketConfig.autoCloseMinutes = auto;

    await saveGuildData(interaction.guild.id, data);

    return interaction.reply({
      embeds: [createSuccessEmbed('Ticket system configuration updated.')]
    });
  }
};

