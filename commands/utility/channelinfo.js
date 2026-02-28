import { SlashCommandBuilder, ChannelType } from 'discord.js';
import { createInfoEmbed } from '../../utils/embedFactory.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('channelinfo')
    .setDescription('Show information about a channel.')
    .addChannelOption(o =>
      o.setName('channel').setDescription('Channel to view.').setRequired(false)
    ),
  cooldown: 5,
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;
    const typeName =
      channel.type === ChannelType.GuildText ? 'Text' :
      channel.type === ChannelType.GuildVoice ? 'Voice' :
      'Other';

    const embed = createInfoEmbed('')
      .setTitle(`Channel: #${channel.name}`)
      .addFields(
        { name: 'ID', value: channel.id, inline: true },
        { name: 'Type', value: typeName, inline: true },
        { name: 'Created', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:F>`, inline: true }
      );

    return interaction.reply({ embeds: [embed] });
  }
};

