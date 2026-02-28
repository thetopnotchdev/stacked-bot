import { Events } from 'discord.js';
import { checkCooldown } from '../handlers/cooldownManager.js';
import { hasHierarchyPermission, hasBotPermissions } from '../handlers/permissionManager.js';
import { createLogger } from '../utils/logger.js';
import { createErrorEmbed } from '../utils/embedFactory.js';
import config from '../utils/config.js';

const logger = createLogger(config.logging.level);

export default {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        if (!hasHierarchyPermission(interaction, command)) {
          return interaction.reply({
            embeds: [
              createErrorEmbed('You do not have permission to use this command.')
            ],
            ephemeral: true
          });
        }

        if (!hasBotPermissions(interaction, command)) {
          return interaction.reply({
            embeds: [
              createErrorEmbed('I am missing required permissions to execute this command.')
            ],
            ephemeral: true
          });
        }

        const remaining = checkCooldown(client, command, interaction.user.id);
        if (remaining > 0) {
          return interaction.reply({
            embeds: [
              createErrorEmbed(`You are on cooldown. Try again in \`${remaining.toFixed(1)}s\`.`)
            ],
            ephemeral: true
          });
        }

        await command.execute(interaction, client);
      }

      // Button / component router for tickets and others
      if (interaction.isButton()) {
        if (interaction.customId === 'ticket-open') {
          const openModule = await import('../commands/tickets/ticket-open.js');
          return openModule.default.executeFromButton(interaction, client);
        }
      }
    } catch (err) {
      logger.error('Interaction error:', err);
      if (interaction.isRepliable() && !interaction.replied) {
        try {
          await interaction.reply({
            embeds: [
              createErrorEmbed('An unexpected error occurred while handling your interaction.')
            ],
            ephemeral: true
          });
        } catch {
          // ignore
        }
      }
    }
  }
};

