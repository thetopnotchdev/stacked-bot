import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';

export default {
  category: 'tickets',
  data: new SlashCommandBuilder()
    .setName('ticket-category')
    .setDescription('Set the category used for ticket channels.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(o =>
      o.setName('category')
        .setDescription('Category for ticket channels.')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true)
    ),
  cooldown: 5,
  async execute(interaction) {
    const category = interaction.options.getChannel('category');
    const data = await getGuildData(interaction.guild.id);
    if (!data.ticketConfig) data.ticketConfig = {};
    data.ticketConfig.categoryId = category.id;
    await saveGuildData(interaction.guild.id, data);

    return interaction.reply({
      embeds: [createSuccessEmbed(`Ticket category set to ${category}.`)]
    });
  }
};

