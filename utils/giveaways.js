import schedule from 'node-schedule';
import { getGuildData, saveGuildData } from './dataStore.js';
import { createInfoEmbed } from './embedFactory.js';
import config from './config.js';
import { parseDuration } from './time.js';

const jobs = new Map();

export async function createGiveaway(interaction, options) {
  const guildData = await getGuildData(interaction.guild.id);

  const endAt = Date.now() + options.durationMs;
  const giveaway = {
    messageId: null,
    channelId: interaction.channel.id,
    guildId: interaction.guild.id,
    prize: options.prize,
    winners: options.winners,
    hostId: interaction.user.id,
    endAt,
    paused: false,
    blacklistRoleIds: [],
    requirementRoleId: options.requireRoleId ?? null
  };

  const embed = createInfoEmbed(
    `${config.emojis.giveaway} **${options.prize}**\n` +
    `Hosted by: ${interaction.user}\n` +
    `Ends <t:${Math.floor(endAt / 1000)}:R>\n` +
    `Winners: **${options.winners}**`
  ).setTitle('🎉 Giveaway');

  const msg = await interaction.channel.send({ embeds: [embed] });
  await msg.react('🎉').catch(() => {});

  giveaway.messageId = msg.id;
  guildData.giveaways.push(giveaway);
  await saveGuildData(interaction.guild.id, guildData);

  scheduleGiveaway(interaction.client, giveaway);
  return giveaway;
}

export function scheduleGiveaway(client, giveaway) {
  const key = `${giveaway.guildId}:${giveaway.messageId}`;
  if (jobs.has(key)) {
    jobs.get(key).cancel();
    jobs.delete(key);
  }
  const runAt = new Date(giveaway.endAt);
  if (runAt.getTime() <= Date.now()) return;

  const job = schedule.scheduleJob(runAt, async () => {
    await finishGiveaway(client, giveaway.guildId, giveaway.messageId);
  });
  jobs.set(key, job);
}

export async function scheduleAllGiveaways(client) {
  const guilds = client.guilds.cache;
  for (const guild of guilds.values()) {
    const data = await getGuildData(guild.id);
    for (const g of data.giveaways.filter(x => !x.paused && x.endAt > Date.now())) {
      scheduleGiveaway(client, g);
    }
  }
}

export async function finishGiveaway(client, guildId, messageId) {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return;
  const guildData = await getGuildData(guildId);

  const giveaway = guildData.giveaways.find(g => g.messageId === messageId);
  if (!giveaway) return;

  const channel = guild.channels.cache.get(giveaway.channelId);
  if (!channel?.isTextBased()) return;

  const msg = await channel.messages.fetch(messageId).catch(() => null);
  if (!msg) return;

  const reactions = msg.reactions.resolve('🎉');
  const users = reactions ? await reactions.users.fetch() : null;
  const entrants = users
    ? users.filter(u => !u.bot).map(u => guild.members.cache.get(u.id)).filter(Boolean)
    : [];

  let winners = [];

  if (entrants.length > 0) {
    const pool = entrants.filter(m => {
      if (giveaway.requirementRoleId && !m.roles.cache.has(giveaway.requirementRoleId)) return false;
      if (giveaway.blacklistRoleIds?.some(r => m.roles.cache.has(r))) return false;
      return true;
    });

    const unique = [...new Set(pool)];
    while (winners.length < giveaway.winners && unique.length > 0) {
      const idx = Math.floor(Math.random() * unique.length);
      winners.push(unique.splice(idx, 1)[0]);
    }
  }

  const embed = msg.embeds[0]?.data ?? {};
  const resultEmbed = createInfoEmbed(
    winners.length > 0
      ? `Winners: ${winners.map(w => `<@${w.id}>`).join(', ')}`
      : 'No eligible winners.'
  )
    .setTitle(embed.title ?? '🎉 Giveaway Ended')
    .setDescription(embed.description ?? '');

  await msg.edit({ embeds: [resultEmbed] }).catch(() => {});

  await channel.send({
    content: winners.length > 0 ? winners.map(w => `<@${w.id}>`).join(' ') : null,
    embeds: [resultEmbed]
  }).catch(() => {});

  giveaway.ended = true;
  await saveGuildData(guildId, guildData);
}

export function parseGiveawayDuration(input) {
  const ms = parseDuration(input);
  if (!ms || ms < 1000 * 30) return null;
  return ms;
}

