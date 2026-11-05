import { build, context } from 'esbuild';
import { mkdirSync, copyFileSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

const serve = process.argv.includes('--serve');
mkdirSync('dist', { recursive: true });

// .env dosyasındaki VITE_ önekli değişkenleri koda göm
const env = {};
if (existsSync('.env')) {
  for (const satir of readFileSync('.env', 'utf8').split('\n')) {
    const m = satir.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const define = {
  'process.env.SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL ?? ''),
  'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY ?? ''),
  'process.env.DEMO': JSON.stringify(process.env.DEMO ?? ''),
};

const opts = {
  entryPoints: ['src/main.tsx'], bundle: true, minify: !serve, sourcemap: serve, outfile: 'dist/app.js',
  format: 'esm', target: 'es2022', jsx: 'automatic', define, loader: { '.css': 'css' }, logLevel: 'info',
};
copyFileSync('index.html', 'dist/index.html');
for (const f of ['favicon.svg', 'favicon-48.png']) if (existsSync(f)) copyFileSync(f, `dist/${f}`);

if (serve) {
  const ctx = await context(opts);
  await ctx.watch();
  const { port } = await ctx.serve({ servedir: 'dist', port: 5173 });
  console.log(`Panel: http://localhost:${port}`);
} else {
  await build(opts);
}
