import chalk from 'chalk';

export function createLogger(level = 'info') {
  const levels = ['error', 'warn', 'info', 'debug'];
  const threshold = levels.indexOf(level);

  function log(lvl, ...args) {
    if (levels.indexOf(lvl) > threshold) return;
    const prefix =
      lvl === 'error' ? chalk.red('[ERROR]') :
      lvl === 'warn'  ? chalk.yellow('[WARN]') :
      lvl === 'debug' ? chalk.gray('[DEBUG]') :
                        chalk.blue('[INFO]');
    console.log(prefix, ...args);
  }

  return {
    error: (...a) => log('error', ...a),
    warn:  (...a) => log('warn',  ...a),
    info:  (...a) => log('info',  ...a),
    debug: (...a) => log('debug', ...a)
  };
}

