import { Events, ActivityType } from 'discord.js';
import { createLogger } from '../utils/logger.js';
import config from '../utils/config.js';

const logger = createLogger(config.logging.level);

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    logger.info(`Ready event fired for ${client.user.tag}`);
    client.user.setActivity('/help for commands', { type: ActivityType.Listening });
  }
};

