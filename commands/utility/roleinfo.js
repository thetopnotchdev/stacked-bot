import { SlashCommandBuilder } from 'discord.js';
import { createInfoEmbed, createErrorEmbed } from '../../utils/embedFactory.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('Show information about a role.')
    .addRoleOption(o =>
      o.setName('role').setDescription('Role to view.').setRequired(true)
    ),
  cooldown: 5,
  async execute(interaction) {
    const role = interaction.options.getRole('role');
    if (!role) {
      return interaction.reply({ embeds: [createErrorEmbed('Role not found.')], ephemeral: true });
    }
    const embed = createInfoEmbed('')
      .setTitle(`Role: ${role.name}`)
      .addFields(
        { name: 'ID', value: role.id, inline: true },
        { name: 'Color', value: role.hexColor, inline: true },
        { name: 'Position', value: `${role.position}`, inline: true },
        { name: 'Members', value: `${role.members.size}`, inline: true }
      );
    return interaction.reply({ embeds: [embed] });
  }
};

