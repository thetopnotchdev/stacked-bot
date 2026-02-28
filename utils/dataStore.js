import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataRoot = path.join(__dirname, '..', 'data');

export async function ensureDataDirs() {
  await fs.ensureDir(dataRoot);
  await fs.ensureDir(path.join(dataRoot, 'guilds'));
}

function guildPath(guildId) {
  return path.join(dataRoot, 'guilds', `${guildId}.json`);
}

export async function getGuildData(guildId) {
  await ensureDataDirs();
  const file = guildPath(guildId);
  if (!(await fs.pathExists(file))) {
    const base = {
      guildId,
      modlogChannelId: null,
      whitelistRoleIds: [],
      cases: [],
      tickets: [],
      giveaways: [],
      reminders: [],
      stickyMessages: [],
      starboard: {
        channelId: null
      },
      suggestions: {
        channelId: null,
        requireApproval: true
      },
      snipe: {},
      autoroleRoleId: null,
      welcomeChannelId: null,
      welcomeMessage: null,
      goodbyeChannelId: null,
      goodbyeMessage: null,
      ticketConfig: {
        categoryId: null,
        maxTicketsPerUser: 3,
        autoCloseMinutes: 60
      },
      giveawayConfig: {},
      afk: {}
    };
    await fs.writeJson(file, base, { spaces: 2 });
    return base;
  }
  return fs.readJson(file);
}

export async function saveGuildData(guildId, data) {
  await ensureDataDirs();
  const file = guildPath(guildId);
  await fs.writeJson(file, data, { spaces: 2 });
}

