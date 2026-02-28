import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';

export default {
  category: 'giveaway',
  data: new SlashCommandBuilder()
    .setName('giveaway-blacklist')
    .setDescription('Blacklist or unblacklist a role from a giveaway.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o =>
      o.setName('messageid').setDescription('Message ID of the giveaway.').setRequired(true)
    )
    .addRoleOption(o =>
      o.setName('role').setDescription('Role to blacklist.').setRequired(true)
    )
    .addBooleanOption(o =>
      o.setName('enabled').setDescription('Whether to blacklist (true) or unblacklist (false).').setRequired(true)
    ),
  cooldown: 5,
  async execute(interaction) {
    const messageId = interaction.options.getString('messageid');
    const role = interaction.options.getRole('role');
    const enabled = interaction.options.getBoolean('enabled');
    const data = await getGuildData(interaction.guild.id);
    const g = data.giveaways.find(x => x.messageId === messageId);
    if (!g) {
      return interaction.reply({
        embeds: [createErrorEmbed('Giveaway not found for that message ID.')],
        ephemeral: true
      });
    }

    if (!g.blacklistRoleIds) g.blacklistRoleIds = [];
    if (enabled) {
      if (!g.blacklistRoleIds.includes(role.id)) g.blacklistRoleIds.push(role.id);
    } else {
      g.blacklistRoleIds = g.blacklistRoleIds.filter(id => id !== role.id);
    }
    await saveGuildData(interaction.guild.id, data);

    return interaction.reply({
      embeds: [createSuccessEmbed(enabled
        ? `Role ${role} blacklisted from this giveaway.`
        : `Role ${role} removed from blacklist.`)]
    });
  }
};

