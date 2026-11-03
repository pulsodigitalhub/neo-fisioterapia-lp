#!/usr/bin/env node
// Envia a lista completa de páginas (LPs inclusive) ao menu Clientes do Link HUB;
// não mexe no sitemap. Uso no Action depois do build/sitemap.

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
const EXCLUDE = new Set(['node_modules', 'dist', '.git', 'src', '.github', '.vercel', '.next', 'docs', 'scripts']);

function findPages(dir, base) {
  const routes = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (EXCLUDE.has(entry.name)) continue;
      routes.push(...findPages(path.join(dir, entry.name), `${base}/${entry.name}`));
    } else if (entry.name === 'index.html') {
      routes.push(base || '/');
    } else if (entry.name.endsWith('.html')) {
      routes.push(`${base}/${entry.name}`);
    }
  }
  return routes;
}

const distDir = path.join(ROOT, 'dist');
const routes = new Set();
const routeFiles = new Map();

function addRoute(r, pagesRoot) {
  const route = r || '/';
  routes.add(route);
  if (routeFiles.has(route)) return;

  const relative = route === '/'
    ? 'index.html'
    : route.endsWith('.html')
      ? route.slice(1)
      : path.join(route.slice(1), 'index.html');
  routeFiles.set(route, path.join(pagesRoot, relative));
}

if (fs.existsSync(distDir)) {
  for (const r of findPages(distDir, '')) addRoute(r, distDir);
} else {
  for (const entry of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (entry.isFile() && entry.name === 'index.html') {
      addRoute('/', ROOT);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      addRoute(`/${entry.name}`, ROOT);
    } else if (entry.isDirectory() && !EXCLUDE.has(entry.name)) {
      const prefix = entry.name === 'public' ? '' : `/${entry.name}`;
      const pagesRoot = entry.name === 'public' ? path.join(ROOT, 'public') : ROOT;
      for (const r of findPages(path.join(ROOT, entry.name), prefix)) {
        addRoute(r, pagesRoot);
      }
    }
  }
}

function toUrl(r) {
  if (r === '/') return '/';
  if (r.endsWith('.html')) return r;
  return `${r}/`;
}

const base = BASE_URL.replace(/\/$/, '');
const paginas = [...routes].sort().map((r) => {
  const html = fs.readFileSync(routeFiles.get(r), 'utf8');
  const noindex = /<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex|<meta[^>]+content=["'][^"']*noindex[^>]*name=["']robots["']/i.test(html);
  const titulo = html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1].trim().slice(0, 200) || null;
  return { url: `${base}${toUrl(r)}`, titulo, indexavel: !noindex };
});

const token = process.env.LINKHUB_TOKEN?.trim();
if (!token) {
  console.log('sem LINKHUB_TOKEN, nada enviado');
  console.log(`${paginas.length} página(s) encontrada(s)`);
  process.exit(0);
}

const agencia = process.env.LINKHUB_AGENCIA?.trim();
const slug = process.env.LINKHUB_SLUG?.trim();
if (!agencia || !slug) {
  console.error('LINKHUB_AGENCIA e LINKHUB_SLUG são obrigatórias.');
  process.exit(1);
}

const linkhubUrl = (process.env.LINKHUB_URL || 'https://linkhub.sergioshouse.com.br').replace(/\/$/, '');
const response = await fetch(`${linkhubUrl}/api/escrita/v1/paginas`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ agencia, slug, paginas }),
});

if (!response.ok) {
  console.error(`Link HUB respondeu ${response.status}: ${await response.text()}`);
  process.exit(1);
}

console.log(JSON.stringify(await response.json(), null, 2));
console.log(`${paginas.length} página(s) enviada(s); ${paginas.filter((pagina) => pagina.indexavel).length} indexável(is).`);
