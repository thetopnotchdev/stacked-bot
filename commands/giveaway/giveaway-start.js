import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { createGiveaway, parseGiveawayDuration } from '../../utils/giveaways.js';

export default {
  category: 'giveaway',
  data: new SlashCommandBuilder()
    .setName('giveaway-start')
    .setDescription('Start a new giveaway.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o =>
      o.setName('prize').setDescription('Giveaway prize.').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('duration').setDescription('Duration (e.g. 30m, 2h, 1d).').setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName('winners').setDescription('Number of winners.').setMinValue(1).setMaxValue(50).setRequired(true)
    ),
  cooldown: 10,
  async execute(interaction) {
    const prize = interaction.options.getString('prize');
    const durationInput = interaction.options.getString('duration');
    const winners = interaction.options.getInteger('winners');

    const ms = parseGiveawayDuration(durationInput);
    if (!ms) {
      return interaction.reply({
        embeds: [createErrorEmbed('Invalid duration. Minimum is 30 seconds (e.g. 30s, 5m, 1h).')],
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });
    await createGiveaway(interaction, {
      prize,
      winners,
      durationMs: ms
    });

    return interaction.editReply({
      embeds: [createSuccessEmbed('Giveaway started. Users can join with 🎉 reaction.')]
    });
  }
};

