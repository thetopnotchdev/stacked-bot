import { getGuildData, saveGuildData } from './dataStore.js';

export async function handleStarboardReaction(reaction, user, added) {
  if (!reaction.message.guild || user.bot) return;
  const data = await getGuildData(reaction.message.guild.id);
  const channelId = data.starboard.channelId;
  const minStars = data.starboard.minStars ?? 3;
  if (!channelId) return;
  if (reaction.emoji.name !== '⭐') return;

  const count = reaction.count ?? 0;
  const starboardChannel = reaction.message.guild.channels.cache.get(channelId);
  if (!starboardChannel?.isTextBased()) return;

  if (count >= minStars && added) {
    await starboardChannel.send({
      content: `⭐ **${count}** <#${reaction.message.channel.id}>`,
      embeds: [{
        description: reaction.message.content ?? '*no content*',
        author: {
          name: reaction.message.author?.tag ?? 'Unknown',
          icon_url: reaction.message.author?.displayAvatarURL() ?? undefined
        }
      }]
    }).catch(() => {});
  }

  await saveGuildData(reaction.message.guild.id, data);
}

