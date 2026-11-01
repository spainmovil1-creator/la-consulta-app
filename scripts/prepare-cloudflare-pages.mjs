import { readdir, mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('out');
const nested = path.join(root, 'consulta');
await mkdir(nested, { recursive: true });
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (entry.name === 'consulta') continue;
  await rename(path.join(root, entry.name), path.join(nested, entry.name));
}
await writeFile(path.join(root, '_redirects'), '/consulta /consulta/ 301\n', 'utf8');
