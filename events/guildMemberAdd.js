import { Events } from 'discord.js';
import { getGuildData, saveGuildData } from '../utils/dataStore.js';
import { createInfoEmbed } from '../utils/embedFactory.js';

export default {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const guildData = await getGuildData(member.guild.id);

    // Autorole
    if (guildData.autoroleRoleId) {
      const role = member.guild.roles.cache.get(guildData.autoroleRoleId);
      if (role) {
        member.roles.add(role).catch(() => {});
      }
    }

    // Welcome message
    if (guildData.welcomeChannelId && guildData.welcomeMessage) {
      const ch = member.guild.channels.cache.get(guildData.welcomeChannelId);
      if (ch?.isTextBased()) {
        const msg = guildData.welcomeMessage
          .replace('{user}', `<@${member.id}>`)
          .replace('{server}', member.guild.name);
        ch.send({ embeds: [createInfoEmbed(msg)] }).catch(() => {});
      }
    }

    // Ensure AFK map exists and clear on join if set
    if (!guildData.afk) guildData.afk = {};
    if (guildData.afk[member.id]) {
      delete guildData.afk[member.id];
      await saveGuildData(member.guild.id, guildData);
    }
  }
};

