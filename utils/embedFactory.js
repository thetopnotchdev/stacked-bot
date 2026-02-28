import { EmbedBuilder } from 'discord.js';
import config from './config.js';

export function baseEmbed() {
  return new EmbedBuilder()
    .setColor(config.embed.color)
    .setFooter({ text: 'Stacked Utility Bot' })
    .setTimestamp();
}

export function createSuccessEmbed(description) {
  return baseEmbed()
    .setColor(config.embed.successColor)
    .setDescription(`${config.emojis.success} ${description}`);
}

export function createErrorEmbed(description) {
  return baseEmbed()
    .setColor(config.embed.errorColor)
    .setDescription(`${config.emojis.error} ${description}`);
}

export function createWarningEmbed(description) {
  return baseEmbed()
    .setColor(config.embed.warningColor)
    .setDescription(`${config.emojis.warning} ${description}`);
}

export function createInfoEmbed(description) {
  return baseEmbed()
    .setDescription(`${config.emojis.info} ${description}`);
}

