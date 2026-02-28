import config from './config.js';
import { getGuildData } from './dataStore.js';

const spamCache = new Map();

export async function handleAutomod(message) {
  if (!config.automod.enabled) return;

  const content = message.content;
  if (!content) return;

  const now = Date.now();
  const key = `${message.guild.id}:${message.author.id}`;
  const guildConfig = config.automod;

  // Spam
  if (guildConfig.spam.enabled) {
    const entry = spamCache.get(key) ?? { count: 0, first: now };
    if (now - entry.first > guildConfig.spam.intervalMs) {
      entry.count = 1;
      entry.first = now;
    } else {
      entry.count++;
    }
    spamCache.set(key, entry);

    if (entry.count >= guildConfig.spam.messageThreshold) {
      await safeDelete(message);
      await warnUser(message, 'Automatic spam filter.');
      entry.count = 0;
      entry.first = now;
      spamCache.set(key, entry);
      return;
    }
  }

  // Caps
  if (guildConfig.caps.enabled && content.length >= guildConfig.caps.minLength) {
    const letters = content.replace(/[^A-Za-z]/g, '');
    if (letters.length >= guildConfig.caps.minLength) {
      const caps = (letters.match(/[A-Z]/g) || []).length;
      if (caps / letters.length >= guildConfig.caps.capsPercent) {
        await safeDelete(message);
        await warnUser(message, 'Automatic caps filter.');
        return;
      }
    }
  }

  // Links / invites
  if (guildConfig.links.enabled || guildConfig.links.blockInvites) {
    const hasInvite = /(discord\.gg|discord\.com\/invite)/i.test(content);
    const hasLink = /https?:\/\/\S+/i.test(content);

    if ((guildConfig.links.blockInvites && hasInvite) ||
        (guildConfig.links.enabled && hasLink)) {
      const guildData = await getGuildData(message.guild.id);
      const whitelisted = guildData.whitelistRoleIds ?? [];
      const memberRoles = message.member?.roles.cache.keys() ?? [];
      if (!Array.from(memberRoles).some(id => whitelisted.includes(id))) {
        await safeDelete(message);
        await warnUser(message, 'Automatic link filter.');
      }
    }
  }
}

async function safeDelete(message) {
  if (!message.deletable) return;
  await message.delete().catch(() => {});
}

async function warnUser(message, reason) {
  await message.channel.send({
    content: `<@${message.author.id}>`,
    allowedMentions: { users: [message.author.id] },
    embeds: [{
      color: 0xED4245,
      description: `🔒 Message removed: ${reason}`
    }]
  }).catch(() => {});
}

