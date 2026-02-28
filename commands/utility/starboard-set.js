import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('starboard-set')
    .setDescription('Configure the starboard.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(o =>
      o.setName('channel')
        .setDescription('Starboard channel.')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName('minstars')
        .setDescription('Minimum stars required.')
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(false)
    ),
  cooldown: 5,
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const minStars = interaction.options.getInteger('minstars');
    const data = await getGuildData(interaction.guild.id);
    data.starboard.channelId = channel.id;
    if (minStars !== null) data.starboard.minStars = minStars;
    await saveGuildData(interaction.guild.id, data);

    return interaction.reply({
      embeds: [createSuccessEmbed('Starboard configuration updated.')]
    });
  }
};

