#!/usr/bin/env node
// Gera sitemap.xml varrendo pastas com index.html no repo (fonte, não build output).
// Uso: SITEMAP_BASE_URL=https://exemplo.com.br node scripts/generate-sitemap.mjs

import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = process.env.SITEMAP_BASE_URL;
if (!BASE_URL) {
  console.error('SITEMAP_BASE_URL não definida.');
  process.exit(1);
}

const ROOT = process.cwd();
const EXCLUDE = new Set(['node_modules', 'dist', '.git', 'src', '.github', '.vercel', '.next']);

function findPages(dir, base) {
  const routes = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (EXCLUDE.has(entry.name)) continue;
      routes.push(...findPages(path.join(dir, entry.name), `${base}/${entry.name}`));
    } else if (entry.name === 'index.html') {
      routes.push(base || '/');
    }
  }
  return routes;
}

const routes = new Set();
for (const entry of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (entry.isFile() && entry.name === 'index.html') {
    routes.add('/');
  } else if (entry.isDirectory() && !EXCLUDE.has(entry.name)) {
    // conteúdo de public/ é servido a partir da raiz do site (padrão Vite) — sem prefixo /public
    const prefix = entry.name === 'public' ? '' : `/${entry.name}`;
    for (const r of findPages(path.join(ROOT, entry.name), prefix)) {
      routes.add(r || '/');
    }
  }
}

const sorted = [...routes].sort();
const base = BASE_URL.replace(/\/$/, '');
const urls = sorted
  .map((r) => `  <url>\n    <loc>${base}${r === '/' ? '/' : r + '/'}</loc>\n  </url>`)
  .join('\n');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

const outDir = fs.existsSync(path.join(ROOT, 'public')) ? path.join(ROOT, 'public') : ROOT;
const outPath = path.join(outDir, 'sitemap.xml');
fs.writeFileSync(outPath, xml);
console.log(`sitemap.xml gerado com ${sorted.length} rota(s) em ${path.relative(ROOT, outPath)}`);
sorted.forEach((r) => console.log(`  ${base}${r === '/' ? '/' : r + '/'}`));
