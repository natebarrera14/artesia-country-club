import { defineConfig } from 'vite';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { resourcePages } from './src/resource-data.js';
const slugs = [...resourcePages.flatMap(p=>[p.slug,...(p.aliases||[])]),'course-map','golf-2','tournaments'];
const pages = slugs.map(slug=>`${slug}/index.html`).filter(p=>existsSync(p));
export default defineConfig({build:{rollupOptions:{input:[resolve('index.html'),resolve('404.html'),...pages.map(p=>resolve(p))]}},server:{host:'127.0.0.1'},preview:{host:'127.0.0.1'}});
