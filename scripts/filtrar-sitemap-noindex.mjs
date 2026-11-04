#!/usr/bin/env node
// LP de anúncio sai do sitemap por regra X-Robots-Tag do vercel.json.

import fs from 'node:fs';
import path from 'node:path';
import { carregarRegrasNoindex, ehNoindex } from './regras-noindex.mjs';

const root = process.cwd();
const regras = carregarRegrasNoindex(root);
if (!regras.length) {
  console.warn('Nenhuma regra noindex encontrada; sitemap não alterado.');
  process.exit(0);
}

const sitemapPath = [path.join(root, 'public', 'sitemap.xml'), path.join(root, 'sitemap.xml')].find(fs.existsSync);
if (!sitemapPath) {
  console.warn('Sitemap não encontrado.');
  process.exit(0);
}

const sitemap = fs.readFileSync(sitemapPath, 'utf8');
let removidas = 0;
const filtrado = sitemap.replace(/\s*<url\b[^>]*>[\s\S]*?<\/url>/gi, (bloco) => {
  const loc = bloco.match(/<loc\b[^>]*>([\s\S]*?)<\/loc>/i)?.[1].trim();
  try {
    if (loc && ehNoindex(new URL(loc).pathname, regras)) {
      removidas += 1;
      return '';
    }
  } catch {}
  return bloco;
});

if (filtrado !== sitemap) fs.writeFileSync(sitemapPath, filtrado);
const restantes = [...filtrado.matchAll(/<loc\b[^>]*>[\s\S]*?<\/loc>/gi)].length;
console.log(`${restantes} URL(s) ficaram; ${removidas} saíram.`);
