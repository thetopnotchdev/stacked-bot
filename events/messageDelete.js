import { Events } from 'discord.js';
import { handleSnipeStoreOnDelete } from '../utils/snipeStore.js';

export default {
  name: Events.MessageDelete,
  async execute(message) {
    if (!message.guild || message.author?.bot) return;
    await handleSnipeStoreOnDelete(message);
  }
};

