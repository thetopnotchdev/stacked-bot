import { PermissionsBitField } from 'discord.js';
import { getGuildData, saveGuildData } from './dataStore.js';
import { createInfoEmbed } from './embedFactory.js';
import config from './config.js';
import { parseDuration, formatDuration } from './time.js';

export async function createCase(guild, data) {
  const guildData = await getGuildData(guild.id);
  const id = (guildData.cases.at(-1)?.id ?? 0) + 1;
  const entry = {
    id,
    userId: data.userId,
    moderatorId: data.moderatorId,
    type: data.type,
    reason: data.reason ?? 'No reason provided',
    createdAt: Date.now(),
    expiresAt: data.expiresAt ?? null,
    active: true,
    extra: data.extra ?? {}
  };
  guildData.cases.push(entry);
  await saveGuildData(guild.id, guildData);
  await sendModlog(guild, entry);
  return entry;
}

async function sendModlog(guild, entry) {
  const guildData = await getGuildData(guild.id);
  if (!guildData.modlogChannelId) return;
  const ch = guild.channels.cache.get(guildData.modlogChannelId);
  if (!ch?.isTextBased()) return;

  const embed = createInfoEmbed(
    `${config.emojis.mod} **Case #${entry.id}** - ${entry.type}\n` +
    `User: <@${entry.userId}> (${entry.userId})\n` +
    `Moderator: <@${entry.moderatorId}> (${entry.moderatorId})\n` +
    `Reason: ${entry.reason}` +
    (entry.expiresAt ? `\nExpires in: ${formatDuration(entry.expiresAt - Date.now())}` : '')
  );

  await ch.send({ embeds: [embed] }).catch(() => {});
}

export function canModerate(executor, target) {
  if (!executor || !target) return false;
  if (executor.id === target.id) return false;
  if (target.id === executor.guild.ownerId) return false;
  if (executor.roles.highest.position <= target.roles.highest.position) return false;
  return true;
}

export function ensureModPermissions(member) {
  return member.permissions.has(PermissionsBitField.Flags.ModerateMembers) ||
         member.permissions.has(PermissionsBitField.Flags.BanMembers) ||
         member.permissions.has(PermissionsBitField.Flags.KickMembers);
}

export function parseTimeoutDuration(input) {
  const ms = parseDuration(input);
  if (!ms) return null;
  if (ms < 1000 || ms > 28 * 24 * 60 * 60 * 1000) return null;
  return ms;
}

