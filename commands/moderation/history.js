import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createInfoEmbed } from '../../utils/embedFactory.js';
import { getGuildData } from '../../utils/dataStore.js';
import { formatDuration } from '../../utils/time.js';

export default {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('history')
    .setDescription('View a member’s moderation history.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o =>
      o.setName('user').setDescription('User to check.').setRequired(true)
    ),
  cooldown: 5,
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const data = await getGuildData(interaction.guild.id);
    const cases = data.cases.filter(c => c.userId === target.id);

    if (cases.length === 0) {
      return interaction.reply({
        embeds: [createInfoEmbed(`${target.tag} has no moderation history.`)],
        ephemeral: true
      });
    }

    const lines = cases
      .slice(-15)
      .map(c => {
        const created = `<t:${Math.floor(c.createdAt / 1000)}:R>`;
        const exp = c.expiresAt ? ` • Expires: ${formatDuration(c.expiresAt - Date.now())}` : '';
        return `\`#${c.id}\` **${c.type}** - ${c.reason} (by <@${c.moderatorId}>) • ${created}${exp}`;
      });

    return interaction.reply({
      embeds: [createInfoEmbed(`History for **${target.tag}**:\n${lines.join('\n')}`)],
      ephemeral: true
    });
  }
};

