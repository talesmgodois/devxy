export interface Sponsor {
  id: string;
  name: string;
  logo?: string;
  website: string;
  message?: string;
  tier: 'gold' | 'silver' | 'bronze' | 'community';
}

export interface SupportLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  description: string;
}

// Current sponsors - update this when sponsors are added
export const SPONSORS: Sponsor[] = [
  // Example sponsor (uncomment when you have sponsors):
  // {
  //   id: 'example-sponsor',
  //   name: 'Example Corp',
  //   logo: 'https://example.com/logo.png',
  //   website: 'https://example.com',
  //   message: 'Proud to support open source development',
  //   tier: 'gold',
  // },
];

// Support/donation links
export const SUPPORT_LINKS: SupportLink[] = [
  {
    id: 'github-sponsors',
    name: 'GitHub Sponsors',
    url: 'https://github.com/sponsors/mgodois',
    icon: '❤️',
    description: 'Support via GitHub Sponsors',
  },
  {
    id: 'buy-me-coffee',
    name: 'Buy Me a Coffee',
    url: 'https://buymeacoffee.com/mgodois',
    icon: '☕',
    description: 'Buy me a coffee',
  },
];

export const getSponsorInfo = (): string => {
  const sponsorSection = SPONSORS.length > 0
    ? SPONSORS.map(s => `  ${s.tier.toUpperCase().padEnd(10)} ${s.name} - ${s.website}`).join('\n')
    : '  No sponsors yet - Be the first! 🚀';

  const supportSection = SUPPORT_LINKS
    .map(link => `  ${link.icon} ${link.name.padEnd(20)} ${link.url}`)
    .join('\n');

  return `
╔══════════════════════════════════════════════════════════╗
║                    SUPPORT DEVXY                         ║
╠══════════════════════════════════════════════════════════╣
║  Devxy is free and open source. Your support helps       ║
║  keep the project maintained and growing!                ║
╠══════════════════════════════════════════════════════════╣
║  CURRENT SPONSORS:                                       ║
${sponsorSection.split('\n').map(line => `║${line.padEnd(58)}║`).join('\n')}
╠══════════════════════════════════════════════════════════╣
║  SUPPORT OPTIONS:                                        ║
${supportSection.split('\n').map(line => `║${line.padEnd(58)}║`).join('\n')}
╠══════════════════════════════════════════════════════════╣
║  Want to become a sponsor? Contact: tales@mgodois.com    ║
╚══════════════════════════════════════════════════════════╝
`.trim();
};

export const hasSponsors = (): boolean => SPONSORS.length > 0;

export const getMainSponsor = (): Sponsor | null => {
  return SPONSORS.find(s => s.tier === 'gold') || SPONSORS[0] || null;
};
