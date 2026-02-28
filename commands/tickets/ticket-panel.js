import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } from 'discord.js';
import { createSuccessEmbed } from '../../utils/embedFactory.js';

export default {
  category: 'tickets',
  data: new SlashCommandBuilder()
    .setName('ticket-panel')
    .setDescription('Send a ticket creation panel in this channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o =>
      o.setName('label')
        .setDescription('Button label.')
        .setRequired(false)
    ),
  cooldown: 10,
  async execute(interaction) {
    if (interaction.channel.type !== ChannelType.GuildText) {
      return interaction.reply({ content: 'Use this in a text channel.', ephemeral: true });
    }

    const label = interaction.options.getString('label') ?? 'Open Ticket';

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket-open')
        .setLabel(label)
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.channel.send({
      embeds: [createSuccessEmbed('Click the button below to open a ticket.')],
      components: [row]
    });

    return interaction.reply({
      embeds: [createSuccessEmbed('Ticket panel created.')],
      ephemeral: true
    });
  }
};

