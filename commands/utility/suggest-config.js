import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('suggest-config')
    .setDescription('Configure suggestion system.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(o =>
      o.setName('channel')
        .setDescription('Suggestion channel.')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addBooleanOption(o =>
      o.setName('requireapproval')
        .setDescription('Whether staff must approve suggestions before marking accepted/denied.')
        .setRequired(false)
    ),
  cooldown: 5,
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const requireApproval = interaction.options.getBoolean('requireapproval');
    const data = await getGuildData(interaction.guild.id);
    data.suggestions.channelId = channel.id;
    if (requireApproval !== null) data.suggestions.requireApproval = requireApproval;
    await saveGuildData(interaction.guild.id, data);

    return interaction.reply({
      embeds: [createSuccessEmbed('Suggestion system configuration updated.')]
    });
  }
};

