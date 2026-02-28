import { SlashCommandBuilder } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { parseDuration } from '../../utils/time.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('timer')
    .setDescription('Start a simple countdown timer (non-persistent).')
    .addStringOption(o =>
      o.setName('duration').setDescription('Duration (e.g. 10s, 2m).').setRequired(true)
    ),
  cooldown: 5,
  async execute(interaction) {
    const duration = interaction.options.getString('duration');
    const ms = parseDuration(duration);
    if (!ms || ms < 1000 || ms > 60 * 60 * 1000) {
      return interaction.reply({
        embeds: [createErrorEmbed('Invalid duration. Use between 1s and 1h (e.g. 30s, 5m).')],
        ephemeral: true
      });
    }

    await interaction.reply({
      embeds: [createSuccessEmbed(`Timer started for \`${duration}\`.`)]
    });

    setTimeout(() => {
      interaction.followUp({
        content: `<@${interaction.user.id}>`,
        embeds: [createSuccessEmbed(`Timer finished (\`${duration}\`).`)]
      }).catch(() => {});
    }, ms);
  }
};

