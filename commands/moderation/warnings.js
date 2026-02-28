import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createInfoEmbed } from '../../utils/embedFactory.js';
import { getGuildData } from '../../utils/dataStore.js';

export default {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View a member’s warnings.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o =>
      o.setName('user').setDescription('User to check.').setRequired(true)
    ),
  cooldown: 5,
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const data = await getGuildData(interaction.guild.id);
    const warns = data.cases.filter(c => c.userId === target.id && c.type === 'WARN');

    if (warns.length === 0) {
      return interaction.reply({
        embeds: [createInfoEmbed(`${target.tag} has no warnings.`)],
        ephemeral: true
      });
    }

    const lines = warns
      .slice(-10)
      .map(c => `\`#${c.id}\` - ${c.reason} (by <@${c.moderatorId}>)`);

    return interaction.reply({
      embeds: [createInfoEmbed(`Latest warnings for **${target.tag}**:\n${lines.join('\n')}`)],
      ephemeral: true
    });
  }
};

