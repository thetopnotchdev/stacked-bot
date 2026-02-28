import { SlashCommandBuilder } from 'discord.js';
import { createInfoEmbed } from '../../utils/embedFactory.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Show information about this server.'),
  cooldown: 5,
  async execute(interaction) {
    const g = interaction.guild;
    const embed = createInfoEmbed('')
      .setAuthor({ name: g.name, iconURL: g.iconURL() ?? undefined })
      .addFields(
        { name: 'ID', value: g.id, inline: true },
        { name: 'Owner', value: `<@${g.ownerId}>`, inline: true },
        { name: 'Members', value: `${g.memberCount}`, inline: true },
        { name: 'Created', value: `<t:${Math.floor(g.createdTimestamp / 1000)}:F>`, inline: true }
      );
    return interaction.reply({ embeds: [embed] });
  }
};

