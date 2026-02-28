import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import config from './utils/config.js';
import { loadCommands } from './handlers/commandLoader.js';
import { loadEvents } from './handlers/eventLoader.js';
import { createLogger } from './utils/logger.js';
import { ensureDataDirs } from './utils/dataStore.js';
import { scheduleAllGiveaways } from './utils/giveaways.js';
import { scheduleAllReminders } from './utils/reminders.js';
import { loadStickyMessages } from './utils/stickyMessages.js';

const logger = createLogger(config.logging.level);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// Collections
client.commands = new Collection();
client.cooldowns = new Collection();
client.config = config;

(async () => {
  try {
    await ensureDataDirs();
    await loadCommands(client);
    await loadEvents(client);

    client.once('ready', async () => {
      logger.info(`Logged in as ${client.user.tag}`);
      try {
        await scheduleAllGiveaways(client);
        await scheduleAllReminders(client);
        await loadStickyMessages(client);
        logger.info('Scheduled persistent tasks (giveaways, reminders, sticky messages).');
      } catch (err) {
        logger.error('Error scheduling persistent tasks:', err);
      }
    });

    await client.login(config.token);
  } catch (err) {
    logger.error('Fatal startup error:', err);
    process.exit(1);
  }
})();

