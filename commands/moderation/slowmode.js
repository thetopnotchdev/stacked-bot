import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';

export default {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set slowmode for the current channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addIntegerOption(o =>
      o.setName('seconds')
        .setDescription('Slowmode in seconds (0 to disable, max 21600).')
        .setRequired(true)
    ),
  cooldown: 5,
  requiredClientPermissions: [PermissionFlagsBits.ManageChannels],
  async execute(interaction) {
    const seconds = interaction.options.getInteger('seconds');
    if (seconds < 0 || seconds > 21600) {
      return interaction.reply({
        embeds: [createErrorEmbed('Seconds must be between 0 and 21600 (6 hours).')],
        ephemeral: true
      });
    }

    await interaction.channel.setRateLimitPerUser(seconds, `Slowmode set by ${interaction.user.tag}`).catch(err => {
      throw err;
    });

    return interaction.reply({
      embeds: [createSuccessEmbed(seconds === 0
        ? 'Slowmode disabled in this channel.'
        : `Slowmode set to \`${seconds}s\` in this channel.`)]
    });
  }
};

