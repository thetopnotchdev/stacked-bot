import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';

export default {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('reason')
    .setDescription('Edit the reason for a moderation case.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand(sub =>
      sub.setName('edit')
        .setDescription('Edit a case reason.')
        .addIntegerOption(o =>
          o.setName('id').setDescription('Case ID.').setRequired(true)
        )
        .addStringOption(o =>
          o.setName('reason').setDescription('New reason.').setRequired(true)
        )
    ),
  cooldown: 5,
  async execute(interaction) {
    const id = interaction.options.getInteger('id');
    const newReason = interaction.options.getString('reason');
    const data = await getGuildData(interaction.guild.id);
    const entry = data.cases.find(c => c.id === id);

    if (!entry) {
      return interaction.reply({
        embeds: [createErrorEmbed('Case not found.')],
        ephemeral: true
      });
    }

    entry.reason = newReason;
    await saveGuildData(interaction.guild.id, data);

    return interaction.reply({
      embeds: [createSuccessEmbed(`Updated reason for case #${id}.`)]
    });
  }
};

