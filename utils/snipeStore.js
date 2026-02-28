import { getGuildData, saveGuildData } from './dataStore.js';

export function handleSnipeStoreOnCreate() {
  // reserved for future extensions
}

export async function handleSnipeStoreOnDelete(message) {
  const data = await getGuildData(message.guild.id);
  data.snipe[message.channel.id] = {
    content: message.content,
    authorId: message.author.id,
    createdAt: Date.now()
  };
  await saveGuildData(message.guild.id, data);
}

export async function handleSnipeStoreOnUpdate(oldMessage, newMessage) {
  const data = await getGuildData(newMessage.guild.id);
  data.snipe[`edit_${newMessage.channel.id}`] = {
    oldContent: oldMessage.content,
    newContent: newMessage.content,
    authorId: newMessage.author.id,
    updatedAt: Date.now()
  };
  await saveGuildData(newMessage.guild.id, data);
}

