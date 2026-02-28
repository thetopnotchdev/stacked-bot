import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { importBackup } from '../../utils/backups.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('backup-load')
    .setDescription('Load a JSON backup for this server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addAttachmentOption(o =>
      o.setName('file').setDescription('Backup JSON file.').setRequired(true)
    ),
  cooldown: 60,
  async execute(interaction) {
    const attachment = interaction.options.getAttachment('file');
    if (!attachment || !attachment.contentType?.includes('json')) {
      return interaction.reply({
        embeds: [createErrorEmbed('Please upload a valid JSON backup file.')],
        ephemeral: true
      });
    }

    const res = await fetch(attachment.url).catch(() => null);
    if (!res || !res.ok) {
      return interaction.reply({
        embeds: [createErrorEmbed('Could not download the backup file.')],
        ephemeral: true
      });
    }
    const text = await res.text();
    try {
      await importBackup(interaction.guild.id, text);
    } catch {
      return interaction.reply({
        embeds: [createErrorEmbed('Failed to parse or import the backup file.')],
        ephemeral: true
      });
    }

    return interaction.reply({
      embeds: [createSuccessEmbed('Backup imported successfully.')],
      ephemeral: true
    });
  }
};

