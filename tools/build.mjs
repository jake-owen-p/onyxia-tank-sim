import { build } from 'esbuild';
import { mkdir, cp, readFile, writeFile, rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist/src/ui', { recursive: true });
await mkdir('dist/data/encounters', { recursive: true });
await Promise.all([
  cp('assets', 'dist/assets', { recursive: true }),
  cp('src/ui/styles.css', 'dist/src/ui/styles.css'),
  cp('data/encounters/index.json', 'dist/data/encounters/index.json'),
  cp('data/encounters/onyxia.json', 'dist/data/encounters/onyxia.json'),
]);
await build({ entryPoints: ['src/main.js'], bundle: true, outfile: 'dist/app.js', format: 'esm', target: 'es2022', minify: true, legalComments: 'none' });
await writeFile('dist/index.html', (await readFile('index.html', 'utf8')).replace('src/main.js', 'app.js'));
console.log('Built game. Only Onyxia encounter data is public; other encounters require the API.');
