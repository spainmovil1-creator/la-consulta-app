import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const rootDir = process.cwd();

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const subpath = specifier.slice(2);
    const basePath = path.resolve(rootDir, subpath);
    for (const ext of ['', '.ts', '.tsx', '.js', '/index.ts', '/index.js']) {
      const fullPath = basePath + ext;
      if (fs.existsSync(fullPath) && !fs.statSync(fullPath).isDirectory()) {
        return nextResolve(pathToFileURL(fullPath).href, context);
      }
    }
  }
  return nextResolve(specifier, context);
}
