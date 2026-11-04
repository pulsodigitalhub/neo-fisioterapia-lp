import fs from 'node:fs';
import path from 'node:path';

export function carregarRegrasNoindex(root = process.cwd()) {
  const arquivo = path.join(root, 'vercel.json');
  if (!fs.existsSync(arquivo)) return [];

  let configuracao;
  try {
    configuracao = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
  } catch (erro) {
    console.warn(`Não foi possível ler ${arquivo}: ${erro.message}`);
    return [];
  }

  const regras = [];
  for (const regra of Array.isArray(configuracao.headers) ? configuracao.headers : []) {
    const temNoindex = Array.isArray(regra.headers) && regra.headers.some(({ key, value }) => (
      typeof key === 'string'
      && key.toLowerCase() === 'x-robots-tag'
      && typeof value === 'string'
      && value.toLowerCase().includes('noindex')
    ));
    if (!temNoindex) continue;

    try {
      if (typeof regra.source !== 'string') throw new TypeError('source deve ser uma string');
      regras.push(new RegExp(`^${regra.source}$`));
    } catch (erro) {
      console.warn(`Regra noindex inválida (${regra.source}): ${erro.message}`);
    }
  }
  return regras;
}

export function ehNoindex(pathname, regras) {
  const caminhos = pathname !== '/' && pathname.endsWith('/')
    ? [pathname, pathname.slice(0, -1)]
    : [pathname];
  return caminhos.some((caminho) => regras.some((regra) => regra.test(caminho)));
}
