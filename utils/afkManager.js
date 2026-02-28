import { getGuildData, saveGuildData } from './dataStore.js';

export async function setAfk(guildId, userId, reason) {
  const data = await getGuildData(guildId);
  if (!data.afk) data.afk = {};
  data.afk[userId] = { reason, since: Date.now() };
  await saveGuildData(guildId, data);
  return data.afk[userId];
}

export async function clearAfk(guildId, userId) {
  const data = await getGuildData(guildId);
  if (!data.afk) return;
  if (data.afk[userId]) {
    delete data.afk[userId];
    await saveGuildData(guildId, data);
  }
}

export async function getAfk(guildId, userId) {
  const data = await getGuildData(guildId);
  return data.afk?.[userId] ?? null;
}

