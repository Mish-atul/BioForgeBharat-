import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'artifacts/catalyst-ai/src/pages');
const compDir = path.join(process.cwd(), 'artifacts/catalyst-ai/src/components');

const replacements = [
  { old: /text-white/g, new: 'text-slate-900' },
  { old: /bg-black\/40/g, new: 'bg-white/40' },
  { old: /bg-black\/50/g, new: 'bg-white/50' },
  { old: /bg-black\/60/g, new: 'bg-white/60' },
  { old: /bg-\[#1A1528\]\/80/g, new: 'bg-white/60' },
  { old: /bg-\[#1A1528\]\/85/g, new: 'bg-white/60' },
  { old: /bg-\[#1A1528\]\/95/g, new: 'bg-white/70' },
  { old: /bg-\[#1A1528\]/g, new: 'bg-white/60' },
  { old: /bg-\[#080310\]\/90/g, new: 'bg-white/60' },
  { old: /bg-\[#080310\]\/50/g, new: 'bg-white/40' },
  { old: /border-white\/5(?!\d)/g, new: 'border-white/40' },
  { old: /border-white\/10/g, new: 'border-white/50' },
  { old: /border-white\/20/g, new: 'border-white/60' },
  { old: /bg-white\/5(?!\d)/g, new: 'bg-white/30' },
  { old: /text-\[#110F1A\]/g, new: 'text-white' },
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (file !== 'landing.tsx' && file !== 'layout.tsx') {
         replacements.forEach(r => {
           content = content.replace(r.old, r.new);
         });
         fs.writeFileSync(fullPath, content);
      }
    }
  }
}

processDir(pagesDir);
processDir(compDir);
console.log('Done');