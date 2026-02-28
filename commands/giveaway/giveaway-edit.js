import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';
import { parseGiveawayDuration, scheduleGiveaway } from '../../utils/giveaways.js';

export default {
  category: 'giveaway',
  data: new SlashCommandBuilder()
    .setName('giveaway-edit')
    .setDescription('Edit an ongoing giveaway.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o =>
      o.setName('messageid').setDescription('Message ID of the giveaway.').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('duration').setDescription('Add time (e.g. 10m, 1h).')
    )
    .addIntegerOption(o =>
      o.setName('winners').setDescription('New winner count.').setMinValue(1).setMaxValue(50)
    ),
  cooldown: 5,
  async execute(interaction) {
    const messageId = interaction.options.getString('messageid');
    const extraDuration = interaction.options.getString('duration');
    const winners = interaction.options.getInteger('winners');
    const data = await getGuildData(interaction.guild.id);
    const g = data.giveaways.find(x => x.messageId === messageId);
    if (!g) {
      return interaction.reply({
        embeds: [createErrorEmbed('Giveaway not found for that message ID.')],
        ephemeral: true
      });
    }

    if (extraDuration) {
      const ms = parseGiveawayDuration(extraDuration);
      if (!ms) {
        return interaction.reply({
          embeds: [createErrorEmbed('Invalid duration. Use formats like 10m, 1h.')],
          ephemeral: true
        });
      }
      g.endAt += ms;
    }
    if (typeof winners === 'number') {
      g.winners = winners;
    }
    await saveGuildData(interaction.guild.id, data);
    scheduleGiveaway(interaction.client, g);

    return interaction.reply({
      embeds: [createSuccessEmbed('Giveaway updated.')]
    });
  }
};

