import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Configure join autorole.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addRoleOption(o =>
      o.setName('role').setDescription('Role to give on join (clear if omitted).').setRequired(false)
    ),
  cooldown: 5,
  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const data = await getGuildData(interaction.guild.id);
    data.autoroleRoleId = role ? role.id : null;
    await saveGuildData(interaction.guild.id, data);

    return interaction.reply({
      embeds: [role
        ? createSuccessEmbed(`New members will receive ${role}.`)
        : createErrorEmbed('Autorole disabled.')]
    });
  }
};

