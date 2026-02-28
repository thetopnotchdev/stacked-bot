import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { canModerate } from '../../utils/moderation.js';

export default {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('nickname')
    .setDescription('Change a member’s nickname.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
    .addUserOption(o =>
      o.setName('user').setDescription('User to rename.').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('nickname').setDescription('New nickname (leave empty to reset).')
    ),
  cooldown: 5,
  requiredClientPermissions: [PermissionFlagsBits.ManageNicknames],
  async execute(interaction) {
    const member = interaction.options.getMember('user');
    const nick = interaction.options.getString('nickname');

    if (!member) {
      return interaction.reply({
        embeds: [createErrorEmbed('User not found in this server.')],
        ephemeral: true
      });
    }
    if (!canModerate(interaction.member, member)) {
      return interaction.reply({
        embeds: [createErrorEmbed('You cannot change this member’s nickname due to role hierarchy.')],
        ephemeral: true
      });
    }

    await member.setNickname(nick || null, `Nickname changed by ${interaction.user.tag}`).catch(err => {
      throw err;
    });

    return interaction.reply({
      embeds: [createSuccessEmbed(nick
        ? `Nickname for ${member.user.tag} set to **${nick}**.`
        : `Nickname for ${member.user.tag} reset.`)]
    });
  }
};

