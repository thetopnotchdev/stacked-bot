import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData } from '../../utils/dataStore.js';
import fs from 'fs';
import path from 'path';

export default {
  category: 'tickets',
  data: new SlashCommandBuilder()
    .setName('ticket-transcript')
    .setDescription('Generate a text transcript for this ticket.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  cooldown: 30,
  async execute(interaction) {
    const data = await getGuildData(interaction.guild.id);
    const ticket = data.tickets.find(t => t.channelId === interaction.channel.id);
    if (!ticket) {
      return interaction.reply({
        embeds: [createErrorEmbed('This channel is not a ticket.')],
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    const sorted = Array.from(messages.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);

    const lines = sorted.map(m =>
      `[${new Date(m.createdTimestamp).toISOString()}] ${m.author?.tag ?? 'Unknown'}: ${m.content ?? ''}`
    );

    const fileName = `ticket-${ticket.id}-transcript.txt`;
    const filePath = path.join(process.cwd(), fileName);
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');

    await interaction.editReply({
      embeds: [createSuccessEmbed('Transcript generated.')],
      files: [filePath]
    });

    fs.unlink(filePath, () => {});
  }
};

