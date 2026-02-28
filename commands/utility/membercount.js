import { SlashCommandBuilder } from 'discord.js';
import { createInfoEmbed } from '../../utils/embedFactory.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('membercount')
    .setDescription('Show the number of members in the server.'),
  cooldown: 5,
  async execute(interaction) {
    const count = interaction.guild.memberCount;
    return interaction.reply({
      embeds: [createInfoEmbed(`This server has **${count}** members.`)]
    });
  }
};

