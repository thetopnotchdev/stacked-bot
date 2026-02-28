import { SlashCommandBuilder } from 'discord.js';
import { createInfoEmbed } from '../../utils/embedFactory.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show available commands.'),
  cooldown: 5,
  async execute(interaction) {
    const { client } = interaction;
    const categories = new Map();

    for (const cmd of client.commands.values()) {
      const category = cmd.category ?? 'general';
      if (!categories.has(category)) categories.set(category, []);
      categories.get(category).push(cmd.data.name);
    }

    const embed = createInfoEmbed('Available commands by category:');
    for (const [cat, names] of categories.entries()) {
      embed.addFields({
        name: cat,
        value: names.map(n => `\`/${n}\``).join(', '),
        inline: false
      });
    }

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};

