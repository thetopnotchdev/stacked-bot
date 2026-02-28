import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { canModerate } from '../../utils/moderation.js';

export default {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Manage member roles.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add a role to a member.')
        .addUserOption(o =>
          o.setName('user').setDescription('User to modify.').setRequired(true)
        )
        .addRoleOption(o =>
          o.setName('role').setDescription('Role to add.').setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove a role from a member.')
        .addUserOption(o =>
          o.setName('user').setDescription('User to modify.').setRequired(true)
        )
        .addRoleOption(o =>
          o.setName('role').setDescription('Role to remove.').setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('set')
        .setDescription('Set a member to have exactly one role (besides @everyone).')
        .addUserOption(o =>
          o.setName('user').setDescription('User to modify.').setRequired(true)
        )
        .addRoleOption(o =>
          o.setName('role').setDescription('Role to set.').setRequired(true)
        )
    ),
  cooldown: 5,
  requiredClientPermissions: [PermissionFlagsBits.ManageRoles],
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const member = interaction.options.getMember('user');
    const role = interaction.options.getRole('role');

    if (!member || !role) {
      return interaction.reply({
        embeds: [createErrorEmbed('Member or role not found.')],
        ephemeral: true
      });
    }
    if (!canModerate(interaction.member, member)) {
      return interaction.reply({
        embeds: [createErrorEmbed('You cannot modify this member due to role hierarchy.')],
        ephemeral: true
      });
    }
    if (role.managed || role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({
        embeds: [createErrorEmbed('I cannot manage that role due to role hierarchy.')],
        ephemeral: true
      });
    }

    if (sub === 'add') {
      await member.roles.add(role, `Role added by ${interaction.user.tag}`).catch(err => {
        throw err;
      });
      return interaction.reply({
        embeds: [createSuccessEmbed(`Added ${role} to ${member}.`)]
      });
    }

    if (sub === 'remove') {
      await member.roles.remove(role, `Role removed by ${interaction.user.tag}`).catch(err => {
        throw err;
      });
      return interaction.reply({
        embeds: [createSuccessEmbed(`Removed ${role} from ${member}.`)]
      });
    }

    if (sub === 'set') {
      const keep = [interaction.guild.id, role.id];
      const toRemove = member.roles.cache.filter(r => !keep.includes(r.id));
      await member.roles.remove(toRemove, `Roles cleared by ${interaction.user.tag}`).catch(() => {});
      await member.roles.add(role, `Role set by ${interaction.user.tag}`).catch(err => {
        throw err;
      });
      return interaction.reply({
        embeds: [createSuccessEmbed(`Set roles for ${member} to only ${role}.`)]
      });
    }
  }
};

