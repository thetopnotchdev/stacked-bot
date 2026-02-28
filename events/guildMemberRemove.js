import { Events } from 'discord.js';
import { getGuildData } from '../utils/dataStore.js';
import { createInfoEmbed } from '../utils/embedFactory.js';

export default {
  name: Events.GuildMemberRemove,
  async execute(member) {
    const guildData = await getGuildData(member.guild.id);
    if (!guildData.goodbyeChannelId || !guildData.goodbyeMessage) return;

    const ch = member.guild.channels.cache.get(guildData.goodbyeChannelId);
    if (!ch?.isTextBased()) return;

    const msg = guildData.goodbyeMessage
      .replace('{user}', member.user?.tag ?? 'A member')
      .replace('{server}', member.guild.name);

    ch.send({ embeds: [createInfoEmbed(msg)] }).catch(() => {});
  }
};

