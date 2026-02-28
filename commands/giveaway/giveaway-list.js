import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createInfoEmbed } from '../../utils/embedFactory.js';
import { getGuildData } from '../../utils/dataStore.js';

export default {
  category: 'giveaway',
  data: new SlashCommandBuilder()
    .setName('giveaway-list')
    .setDescription('List active giveaways.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  cooldown: 5,
  async execute(interaction) {
    const data = await getGuildData(interaction.guild.id);
    const active = data.giveaways.filter(g => !g.ended && g.endAt > Date.now());

    if (active.length === 0) {
      return interaction.reply({
        embeds: [createInfoEmbed('There are no active giveaways.')]
      });
    }

    const lines = active.map(g =>
      `Message ID: \`${g.messageId}\` • Prize: **${g.prize}** • Ends <t:${Math.floor(g.endAt / 1000)}:R>`
    );

    return interaction.reply({
      embeds: [createInfoEmbed(lines.join('\n'))]
    });
  }
};

