import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('goodbye-set')
    .setDescription('Configure goodbye messages.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(o =>
      o.setName('channel')
        .setDescription('Goodbye channel (leave empty to disable).')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .addStringOption(o =>
      o.setName('message')
        .setDescription('Goodbye message (use {user} and {server}).')
        .setRequired(false)
    ),
  cooldown: 5,
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');
    const data = await getGuildData(interaction.guild.id);

    data.goodbyeChannelId = channel ? channel.id : null;
    if (message !== null) data.goodbyeMessage = message;
    await saveGuildData(interaction.guild.id, data);

    return interaction.reply({
      embeds: [createSuccessEmbed('Goodbye configuration updated.')]
    });
  }
};

