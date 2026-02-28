import fs from 'fs';
import path from 'path';
import { getGuildData, saveGuildData } from './dataStore.js';

export async function exportBackup(guildId) {
  const data = await getGuildData(guildId);
  const json = JSON.stringify(data, null, 2);
  const fileName = `guild-${guildId}-backup.json`;
  const filePath = path.join(process.cwd(), fileName);
  fs.writeFileSync(filePath, json, 'utf8');
  return filePath;
}

export async function importBackup(guildId, jsonString) {
  const parsed = JSON.parse(jsonString);
  parsed.guildId = guildId;
  await saveGuildData(guildId, parsed);
}

