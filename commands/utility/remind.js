import { SlashCommandBuilder } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';
import { parseDuration } from '../../utils/time.js';
import { scheduleReminder } from '../../utils/reminders.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Set a reminder.')
    .addStringOption(o =>
      o.setName('in').setDescription('When to remind (e.g. 10m, 1h).').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('text').setDescription('Reminder text.').setRequired(true)
    ),
  cooldown: 5,
  async execute(interaction) {
    const inStr = interaction.options.getString('in');
    const text = interaction.options.getString('text');

    const ms = parseDuration(inStr);
    if (!ms || ms < 5000) {
      return interaction.reply({
        embeds: [createErrorEmbed('Invalid duration. Minimum is 5 seconds.')],
        ephemeral: true
      });
    }

    const when = Date.now() + ms;
    const data = await getGuildData(interaction.guild.id);
    const id = (data.reminders.at(-1)?.id ?? 0) + 1;
    const reminder = {
      id,
      userId: interaction.user.id,
      channelId: interaction.channel.id,
      text,
      timestamp: when
    };
    data.reminders.push(reminder);
    await saveGuildData(interaction.guild.id, data);
    await scheduleReminder(interaction.client, interaction.guild.id, reminder);

    return interaction.reply({
      embeds: [createSuccessEmbed(`I will remind you in \`${inStr}\` about: ${text}`)],
      ephemeral: true
    });
  }
};

