import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';

export default {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('modlogs')
    .setDescription('Configure moderation log channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub =>
      sub.setName('set')
        .setDescription('Set the mod-log channel.')
        .addChannelOption(o =>
          o.setName('channel')
            .setDescription('Channel for moderation logs.')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    ),
  cooldown: 10,
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub !== 'set') return;
    const channel = interaction.options.getChannel('channel');

    const data = await getGuildData(interaction.guild.id);
    data.modlogChannelId = channel.id;
    await saveGuildData(interaction.guild.id, data);

    return interaction.reply({
      embeds: [createSuccessEmbed(`Mod-log channel set to ${channel}.`)]
    });
  }
};

