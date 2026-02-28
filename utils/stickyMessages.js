import { getGuildData, saveGuildData } from './dataStore.js';

export async function loadStickyMessages(client) {
  for (const guild of client.guilds.cache.values()) {
    const data = await getGuildData(guild.id);
    for (const sticky of data.stickyMessages) {
      const ch = guild.channels.cache.get(sticky.channelId);
      if (!ch?.isTextBased()) continue;
      if (sticky.messageId) {
        const msg = await ch.messages.fetch(sticky.messageId).catch(() => null);
        if (!msg) {
          const newMsg = await ch.send(sticky.content).catch(() => null);
          if (newMsg) sticky.messageId = newMsg.id;
        }
      }
    }
    await saveGuildData(guild.id, data);
  }
}

export async function handleStickyOnMessage(message) {
  const data = await getGuildData(message.guild.id);
  const sticky = data.stickyMessages.find(s => s.channelId === message.channel.id);
  if (!sticky) return;

  if (sticky.messageId) {
    const old = await message.channel.messages.fetch(sticky.messageId).catch(() => null);
    if (old && old.deletable) {
      await old.delete().catch(() => {});
    }
  }
  const newMsg = await message.channel.send(sticky.content).catch(() => null);
  if (newMsg) sticky.messageId = newMsg.id;
  await saveGuildData(message.guild.id, data);
}

export async function setSticky(guildId, channelId, content) {
  const data = await getGuildData(guildId);
  let sticky = data.stickyMessages.find(s => s.channelId === channelId);
  if (!sticky) {
    sticky = { channelId, content, messageId: null };
    data.stickyMessages.push(sticky);
  } else {
    sticky.content = content;
  }
  await saveGuildData(guildId, data);
}

export async function removeSticky(guildId, channelId) {
  const data = await getGuildData(guildId);
  data.stickyMessages = data.stickyMessages.filter(s => s.channelId !== channelId);
  await saveGuildData(guildId, data);
}

