import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('starboard-remove')
    .setDescription('Disable the starboard.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  cooldown: 5,
  async execute(interaction) {
    const data = await getGuildData(interaction.guild.id);
    data.starboard.channelId = null;
    await saveGuildData(interaction.guild.id, data);

    return interaction.reply({
      embeds: [createSuccessEmbed('Starboard disabled.')]
    });
  }
};

