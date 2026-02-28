import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createLogger } from '../utils/logger.js';
import config from '../utils/config.js';

const logger = createLogger(config.logging.level);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function loadCommands(client) {
  const commandsPath = path.join(__dirname, '..', 'commands');
  if (!fs.existsSync(commandsPath)) return;

  const categories = fs.readdirSync(commandsPath).filter(f => !f.startsWith('.'));
  const slashData = [];

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));

    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      const fileUrl = pathToFileURL(filePath).href;
      const commandModule = await import(fileUrl);
      const command = commandModule.default;

      if (!command?.data || !command?.execute) {
        logger.warn(`Skipping invalid command file: ${category}/${file}`);
        continue;
      }

      client.commands.set(command.data.name, command);
      slashData.push(command.data.toJSON());
    }
  }

  const rest = new REST({ version: '10' }).setToken(config.token);

  try {
    logger.info(`Registering ${slashData.length} application commands.`);
    await rest.put(Routes.applicationCommands(config.clientId), {
      body: slashData
    });
    logger.info('Slash commands registered globally.');
  } catch (err) {
    logger.error('Error registering commands with Discord:', err);
  }
}

