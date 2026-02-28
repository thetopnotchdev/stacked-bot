export function checkCooldown(client, command, userId) {
  const now = Date.now();
  const cooldownAmount = (command.cooldown ?? 3) * 1000;

  if (!client.cooldowns.has(command.data.name)) {
    client.cooldowns.set(command.data.name, new Map());
  }

  const timestamps = client.cooldowns.get(command.data.name);
  const expirationTime = timestamps.get(userId) ?? 0;

  if (now < expirationTime) {
    const remaining = (expirationTime - now) / 1000;
    return remaining;
  }

  timestamps.set(userId, now + cooldownAmount);
  return 0;
}

