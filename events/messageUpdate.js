import { Events } from 'discord.js';
import { handleSnipeStoreOnUpdate } from '../utils/snipeStore.js';

export default {
  name: Events.MessageUpdate,
  async execute(oldMessage, newMessage) {
    if (!newMessage.guild || newMessage.author?.bot) return;
    await handleSnipeStoreOnUpdate(oldMessage, newMessage);
  }
};

