import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';

export default {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('clearwarnings')
    .setDescription('Clear all warnings for a member.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o =>
      o.setName('user').setDescription('User to clear warnings for.').setRequired(true)
    ),
  cooldown: 5,
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const data = await getGuildData(interaction.guild.id);
    const before = data.cases.length;
    data.cases = data.cases.filter(c => !(c.userId === target.id && c.type === 'WARN'));
    const removed = before - data.cases.length;
    await saveGuildData(interaction.guild.id, data);

    return interaction.reply({
      embeds: [createSuccessEmbed(`Cleared \`${removed}\` warnings for ${target.tag}.`)]
    });
  }
};

