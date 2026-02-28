import { SlashCommandBuilder } from 'discord.js';
import { createSuccessEmbed } from '../../utils/embedFactory.js';
import { setAfk } from '../../utils/afkManager.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Set your AFK status.')
    .addStringOption(o =>
      o.setName('reason').setDescription('Reason for going AFK.').setRequired(false)
    ),
  cooldown: 5,
  async execute(interaction) {
    const reason = interaction.options.getString('reason') ?? 'AFK';
    await setAfk(interaction.guild.id, interaction.user.id, reason);
    return interaction.reply({
      embeds: [createSuccessEmbed(`You are now AFK: ${reason}`)],
      ephemeral: true
    });
  }
};

