import { useEffect } from 'react';

export const SITE_URL = 'https://devxy.mgodois.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

interface SeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const upsertMeta = (attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const upsertLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

const JSON_LD_SCRIPT_ID = 'seo-page-json-ld';

// Manages per-route <title>/meta/canonical/JSON-LD for this client-rendered SPA.
// Every routed page should render <Seo>, otherwise it inherits whatever the
// previously visited page last wrote to <head>.
export function Seo({ title, description, path, image, type = 'website', noindex = false, jsonLd }: SeoProps) {
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : undefined;

  useEffect(() => {
    const url = `${SITE_URL}${path}`;
    const resolvedImage = image ?? DEFAULT_IMAGE;

    document.title = title;
    upsertMeta('name', 'title', title);
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow');
    upsertLink('canonical', url);

    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:image', resolvedImage);

    upsertMeta('name', 'twitter:url', url);
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', resolvedImage);

    let script = document.getElementById(JSON_LD_SCRIPT_ID) as HTMLScriptElement | null;
    if (jsonLdKey) {
      if (!script) {
        script = document.createElement('script');
        script.id = JSON_LD_SCRIPT_ID;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = jsonLdKey;
    } else if (script) {
      script.remove();
    }
  }, [title, description, path, image, type, noindex, jsonLdKey]);

  return null;
}
