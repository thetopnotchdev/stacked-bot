import config from '../utils/config.js';
import { PermissionsBitField } from 'discord.js';

export function hasHierarchyPermission(interaction, command) {
  const member = interaction.member;
  if (!member) return false;

  const isOwner = config.ownerIds.includes(interaction.user.id);
  if (isOwner) return true;

  const requiredDiscordPerms = command.requiredClientPermissions ?? [];
  if (requiredDiscordPerms.length > 0) {
    const missing = member.permissions.missing(requiredDiscordPerms);
    if (missing.length > 0) return false;
  }

  const requiredRoles = command.requiredRoles ?? [];
  if (requiredRoles.length > 0 && member.roles) {
    const hasRole = requiredRoles.some(r => member.roles.cache.has(r));
    if (!hasRole) return false;
  }

  return true;
}

export function hasBotPermissions(interaction, command) {
  const botMember = interaction.guild.members.me;
  if (!botMember) return false;

  const perms = command.requiredBotPermissions ?? [
    PermissionsBitField.Flags.SendMessages,
    PermissionsBitField.Flags.EmbedLinks
  ];

  const missing = botMember.permissions.missing(perms);
  return missing.length === 0;
}

