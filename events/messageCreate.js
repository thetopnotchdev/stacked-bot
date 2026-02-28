import { Events } from 'discord.js';
import { handleAutomod } from '../utils/automod.js';
import { handleStickyOnMessage } from '../utils/stickyMessages.js';
import { handleSnipeStoreOnCreate } from '../utils/snipeStore.js';

export default {
  name: Events.MessageCreate,
  async execute(message) {
    if (!message.guild || message.author.bot) return;

    await handleAutomod(message);
    await handleStickyOnMessage(message);
    handleSnipeStoreOnCreate(message);
  }
};

