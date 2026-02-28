import { SlashCommandBuilder } from 'discord.js';
import { createInfoEmbed } from '../../utils/embedFactory.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Show information about a user.')
    .addUserOption(o =>
      o.setName('user').setDescription('User to view.').setRequired(false)
    ),
  cooldown: 5,
  async execute(interaction) {
    const member = interaction.options.getMember('user') ?? interaction.member;
    const user = member.user;
    const embed = createInfoEmbed('')
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true },
        { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true },
        { name: 'Roles', value: member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r.toString()).join(', ') || 'None' }
      );
    return interaction.reply({ embeds: [embed] });
  }
};

