import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createSuccessEmbed } from '../../utils/embedFactory.js';
import { exportBackup } from '../../utils/backups.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('backup-export')
    .setDescription('Export a JSON backup of this server’s bot data.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  cooldown: 60,
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const filePath = await exportBackup(interaction.guild.id);
    await interaction.editReply({
      embeds: [createSuccessEmbed('Backup exported.')],
      files: [filePath]
    });
  }
};

