import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createSuccessEmbed } from '../../utils/embedFactory.js';

export default {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock the current channel (allow @everyone to send messages).')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  cooldown: 5,
  requiredClientPermissions: [PermissionFlagsBits.ManageChannels],
  async execute(interaction) {
    const channel = interaction.channel;
    const everyone = interaction.guild.roles.everyone;

    await channel.permissionOverwrites.edit(everyone, {
      SendMessages: null
    }, { reason: `Channel unlocked by ${interaction.user.tag}` });

    return interaction.reply({
      embeds: [createSuccessEmbed('Channel has been unlocked.')]
    });
  }
};

