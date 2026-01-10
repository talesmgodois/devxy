export const APP_INFO = {
  name: 'Devxy',
  version: '1.0.0',
  description: 'Developer toolkit aggregator - micro-tools for developers',
  author: {
    name: 'Tales Marinho Godois',
    website: 'https://mgodois.com',
    github: 'https://github.com/talesmgodois',
    email: 'tales@mgodois.com',
  },
  repository: 'https://github.com/talesmgodois/devxy',
  website: 'https://devxy.mgodois.com',
  license: 'MIT',
  support: {
    githubSponsors: 'https://github.com/sponsors/talesmgodois',
    buyMeACoffee: 'https://buymeacoffee.com/mgodois',
  },
} as const;

export const getAboutInfo = (): string => {
  return `
╔══════════════════════════════════════════════════════════╗
║                         DEVXY                            ║
║            Developer Toolkit Aggregator                  ║
╠══════════════════════════════════════════════════════════╣
║  Version:    ${APP_INFO.version.padEnd(42)}║
║  Author:     ${APP_INFO.author.name.padEnd(42)}║
║  Website:    ${APP_INFO.author.website.padEnd(42)}║
║  GitHub:     ${APP_INFO.author.github.padEnd(42)}║
║  Repository: ${APP_INFO.repository.padEnd(42)}║
║  License:    ${APP_INFO.license.padEnd(42)}║
╚══════════════════════════════════════════════════════════╝
`.trim();
};
