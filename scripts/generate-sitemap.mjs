// Regenerates public/sitemap.xml from the actual route list + the VISUAL_TOOLS
// registry, so it can't drift out of sync the way hand-maintained lists do
// (see src/components/visual-tools/index.ts for the single source of truth).
import { createServer } from 'vite';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const SITE_URL = 'https://devxy.mgodois.com';

const STATIC_URLS = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/tools/visual', priority: '0.8', changefreq: 'weekly' },
  { loc: '/install', priority: '0.4', changefreq: 'monthly' },
];

async function main() {
  const server = await createServer({
    root,
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  });

  let toolNames;
  try {
    const mod = await server.ssrLoadModule('/src/components/visual-tools/index.ts');
    toolNames = Object.keys(mod.VISUAL_TOOLS);
  } finally {
    await server.close();
  }

  const today = new Date().toISOString().slice(0, 10);

  const urls = [
    ...STATIC_URLS,
    ...toolNames.map((name) => ({
      loc: `/tools/visual/${name}`,
      priority: '0.6',
      changefreq: 'monthly',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  writeFileSync(path.join(root, 'public', 'sitemap.xml'), xml);
  console.log(`sitemap.xml generated with ${urls.length} URLs (${toolNames.length} visual tools).`);
}

main().catch((err) => {
  console.error('Failed to generate sitemap.xml:', err);
  process.exit(1);
});
