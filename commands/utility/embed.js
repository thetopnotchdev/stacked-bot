import { SlashCommandBuilder } from 'discord.js';
import { baseEmbed, createSuccessEmbed, createErrorEmbed } from '../../utils/embedFactory.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Send a custom embed message.')
    .addStringOption(o =>
      o.setName('title').setDescription('Embed title.').setRequired(false)
    )
    .addStringOption(o =>
      o.setName('description').setDescription('Embed description.').setRequired(true)
    ),
  cooldown: 5,
  async execute(interaction) {
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');

    if (!description) {
      return interaction.reply({ embeds: [createErrorEmbed('Description is required.')], ephemeral: true });
    }

    const embed = baseEmbed().setDescription(description);
    if (title) embed.setTitle(title);

    await interaction.reply({ embeds: [createSuccessEmbed('Embed sent.')] , ephemeral: true });
    await interaction.channel.send({ embeds: [embed] });
  }
};

