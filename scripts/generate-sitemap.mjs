#!/usr/bin/env node
// Gera sitemap.xml varrendo pastas com index.html.
// Se existir dist/ (build já rodou), escaneia o output real do build —
// necessário pra SPAs cujas rotas só existem como pasta depois do build
// (ex: plugin que copia index.html pra rotas fixas no closeBundle do Vite).
// Senão, escaneia o código-fonte direto (repos HTML puro, sem build).
// Sempre escreve em public/sitemap.xml (ou raiz, se não houver public/) —
// nunca em dist/, porque a Vercel builda de novo a partir da fonte.
//
// Uso: SITEMAP_BASE_URL=https://exemplo.com.br node scripts/generate-sitemap.mjs

import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = process.env.SITEMAP_BASE_URL;
if (!BASE_URL) {
  console.error('SITEMAP_BASE_URL não definida.');
  process.exit(1);
}
try {
  const parsed = new URL(BASE_URL);
  if (parsed.protocol !== 'https:') throw new Error('não é https');
} catch (err) {
  console.error(`SITEMAP_BASE_URL inválida (${BASE_URL}): ${err.message}`);
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

const distDir = path.join(ROOT, 'dist');
const routes = new Set();

if (fs.existsSync(distDir)) {
  // pós-build: dist/ já é o output final, sem prefixo "public" a remover
  for (const r of findPages(distDir, '')) routes.add(r || '/');
} else {
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
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

const sorted = [...routes].sort();
const base = BASE_URL.replace(/\/$/, '');
const urls = sorted
  .map((r) => `  <url>\n    <loc>${esc(base + (r === '/' ? '/' : r + '/'))}</loc>\n  </url>`)
  .join('\n');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

// escreve sempre na fonte (public/ ou raiz do repo), nunca em dist/
const outDir = fs.existsSync(path.join(ROOT, 'public')) ? path.join(ROOT, 'public') : ROOT;
const outPath = path.join(outDir, 'sitemap.xml');
fs.writeFileSync(outPath, xml);
console.log(`sitemap.xml gerado com ${sorted.length} rota(s) em ${path.relative(ROOT, outPath)}`);
sorted.forEach((r) => console.log(`  ${base}${r === '/' ? '/' : r + '/'}`));
