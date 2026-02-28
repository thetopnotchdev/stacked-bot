import { getGuildData, saveGuildData } from './dataStore.js';

export async function createSuggestion(guildId, suggestion) {
  const data = await getGuildData(guildId);
  if (!data.suggestionsStore) data.suggestionsStore = [];
  const id = (data.suggestionsStore.at(-1)?.id ?? 0) + 1;
  const entry = { id, ...suggestion, status: 'pending', createdAt: Date.now() };
  data.suggestionsStore.push(entry);
  await saveGuildData(guildId, data);
  return entry;
}

export async function updateSuggestionStatus(guildId, id, status, moderatorId, reason) {
  const data = await getGuildData(guildId);
  const s = data.suggestionsStore?.find(x => x.id === id);
  if (!s) return null;
  s.status = status;
  s.moderatorId = moderatorId;
  s.decisionReason = reason ?? null;
  s.decidedAt = Date.now();
  await saveGuildData(guildId, data);
  return s;
}

