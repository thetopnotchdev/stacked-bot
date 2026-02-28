import { SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField } from 'discord.js';
import { createSuccessEmbed } from '../../utils/embedFactory.js';

export default {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock the current channel (prevent @everyone from sending messages).')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  cooldown: 5,
  requiredClientPermissions: [PermissionFlagsBits.ManageChannels],
  async execute(interaction) {
    const channel = interaction.channel;
    const everyone = interaction.guild.roles.everyone;

    await channel.permissionOverwrites.edit(everyone, {
      SendMessages: false
    }, { reason: `Channel locked by ${interaction.user.tag}` });

    return interaction.reply({
      embeds: [createSuccessEmbed('Channel has been locked.')]
    });
  }
};

