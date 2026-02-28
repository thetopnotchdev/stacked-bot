import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';

export default {
  category: 'giveaway',
  data: new SlashCommandBuilder()
    .setName('giveaway-requirement')
    .setDescription('Set a role requirement for a giveaway.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o =>
      o.setName('messageid').setDescription('Message ID of the giveaway.').setRequired(true)
    )
    .addRoleOption(o =>
      o.setName('role').setDescription('Required role (leave empty to clear).').setRequired(false)
    ),
  cooldown: 5,
  async execute(interaction) {
    const messageId = interaction.options.getString('messageid');
    const role = interaction.options.getRole('role');
    const data = await getGuildData(interaction.guild.id);
    const g = data.giveaways.find(x => x.messageId === messageId);
    if (!g) {
      return interaction.reply({
        embeds: [createErrorEmbed('Giveaway not found for that message ID.')],
        ephemeral: true
      });
    }

    g.requirementRoleId = role ? role.id : null;
    await saveGuildData(interaction.guild.id, data);

    return interaction.reply({
      embeds: [createSuccessEmbed(role
        ? `Users now need role ${role} to win this giveaway.`
        : 'Role requirement cleared for this giveaway.')]
    });
  }
};

