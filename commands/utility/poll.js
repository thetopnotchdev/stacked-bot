import { SlashCommandBuilder } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a simple reaction-based poll.')
    .addStringOption(o =>
      o.setName('question').setDescription('Poll question.').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('options').setDescription('Comma-separated options (2-10).').setRequired(true)
    ),
  cooldown: 10,
  async execute(interaction) {
    const question = interaction.options.getString('question');
    const optionsStr = interaction.options.getString('options');
    const opts = optionsStr.split(',').map(s => s.trim()).filter(Boolean);
    if (opts.length < 2 || opts.length > 10) {
      return interaction.reply({
        embeds: [createErrorEmbed('You must provide between 2 and 10 options, separated by commas.')],
        ephemeral: true
      });
    }

    const emojis = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
    const desc = opts.map((o, i) => `${emojis[i]} ${o}`).join('\n');

    const msg = await interaction.reply({
      embeds: [createSuccessEmbed(question).setDescription(desc)],
      fetchReply: true
    });

    for (let i = 0; i < opts.length; i++) {
      await msg.react(emojis[i]).catch(() => {});
    }
  }
};

