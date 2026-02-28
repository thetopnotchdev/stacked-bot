const units = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000
};

export function parseDuration(str) {
  if (!str) return null;
  const match = /^(\d+)([smhd])$/i.exec(str);
  if (!match) return null;
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  return value * (units[unit] ?? 0);
}

export function formatDuration(ms) {
  const sec = Math.floor(ms / 1000) % 60;
  const min = Math.floor(ms / (60 * 1000)) % 60;
  const hr = Math.floor(ms / (60 * 60 * 1000)) % 24;
  const day = Math.floor(ms / (24 * 60 * 60 * 1000));
  const parts = [];
  if (day) parts.push(`${day}d`);
  if (hr) parts.push(`${hr}h`);
  if (min) parts.push(`${min}m`);
  if (sec) parts.push(`${sec}s`);
  return parts.join(' ') || '0s';
}

