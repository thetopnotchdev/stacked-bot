import schedule from 'node-schedule';
import { getGuildData, saveGuildData } from './dataStore.js';
import { createInfoEmbed } from './embedFactory.js';

const jobs = new Map();

export async function scheduleReminder(client, guildId, reminder) {
  const key = `${guildId}:${reminder.id}`;
  if (jobs.has(key)) {
    jobs.get(key).cancel();
    jobs.delete(key);
  }
  const runAt = new Date(reminder.timestamp);
  if (runAt.getTime() <= Date.now()) return;
  const job = schedule.scheduleJob(runAt, async () => {
    await fireReminder(client, guildId, reminder);
  });
  jobs.set(key, job);
}

export async function scheduleAllReminders(client) {
  for (const guild of client.guilds.cache.values()) {
    const data = await getGuildData(guild.id);
    for (const r of data.reminders.filter(r => r.timestamp > Date.now())) {
      await scheduleReminder(client, guild.id, r);
    }
  }
}

async function fireReminder(client, guildId, reminder) {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return;

  const data = await getGuildData(guildId);
  const channel = guild.channels.cache.get(reminder.channelId);
  if (!channel?.isTextBased()) return;

  await channel.send({
    content: `<@${reminder.userId}>`,
    embeds: [createInfoEmbed(`Reminder: ${reminder.text}`)]
  }).catch(() => {});

  data.reminders = data.reminders.filter(r => r.id !== reminder.id);
  await saveGuildData(guildId, data);
}

