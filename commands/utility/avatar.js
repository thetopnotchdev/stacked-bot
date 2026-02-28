import { SlashCommandBuilder } from 'discord.js';
import { createInfoEmbed } from '../../utils/embedFactory.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Show the avatar of a user.')
    .addUserOption(o =>
      o.setName('user').setDescription('User to view.').setRequired(false)
    ),
  cooldown: 5,
  async execute(interaction) {
    const user = interaction.options.getUser('user') ?? interaction.user;
    const url = user.displayAvatarURL({ size: 512, extension: 'png' });
    const embed = createInfoEmbed(`[Avatar link](${url})`).setAuthor({
      name: user.tag,
      iconURL: url
    }).setImage(url);
    return interaction.reply({ embeds: [embed] });
  }
};

