import { SlashCommandBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../../utils/embedFactory.js';
import { getGuildData, saveGuildData } from '../../utils/dataStore.js';

async function openTicket(interaction, opener) {
  const data = await getGuildData(interaction.guild.id);
  const config = data.ticketConfig ?? {};

  const userTickets = data.tickets.filter(t => t.userId === opener.id && t.open);
  if (userTickets.length >= (config.maxTicketsPerUser ?? 3)) {
    return interaction.reply?.({
      embeds: [createErrorEmbed('You have reached the maximum number of open tickets.')],
      ephemeral: true
    }) ?? interaction.followUp({
      embeds: [createErrorEmbed('You have reached the maximum number of open tickets.')],
      ephemeral: true
    });
  }

  const parent = config.categoryId
    ? interaction.guild.channels.cache.get(config.categoryId)
    : null;

  const channel = await interaction.guild.channels.create({
    name: `ticket-${opener.username}`.slice(0, 32),
    type: ChannelType.GuildText,
    parent: parent?.type === ChannelType.GuildCategory ? parent.id : null,
    permissionOverwrites: [
      {
        id: interaction.guild.id,
        deny: ['ViewChannel']
      },
      {
        id: opener.id,
        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
      }
    ]
  });

  const ticketId = (data.tickets.at(-1)?.id ?? 0) + 1;
  const ticket = {
    id: ticketId,
    channelId: channel.id,
    userId: opener.id,
    createdAt: Date.now(),
    open: true,
    claimedBy: null,
    priority: 'normal',
    topic: 'No topic provided'
  };
  data.tickets.push(ticket);
  await saveGuildData(interaction.guild.id, data);

  await channel.send({
    content: `<@${opener.id}>`,
    embeds: [createSuccessEmbed('Ticket created. A staff member will be with you shortly.')]
  });

  if (interaction.isButton?.()) {
    return interaction.reply({
      embeds: [createSuccessEmbed(`Your ticket has been created: ${channel}.`)],
      ephemeral: true
    });
  }

  return interaction.reply({
    embeds: [createSuccessEmbed(`Ticket created: ${channel}`)],
    ephemeral: true
  });
}

export default {
  category: 'tickets',
  data: new SlashCommandBuilder()
    .setName('ticket-open')
    .setDescription('Open a new support ticket.')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .addStringOption(o =>
      o.setName('topic').setDescription('Short topic/subject.')
    ),
  cooldown: 15,
  async execute(interaction) {
    const opener = interaction.user;
    return openTicket(interaction, opener);
  },
  async executeFromButton(interaction) {
    const opener = interaction.user;
    return openTicket(interaction, opener);
  }
};

