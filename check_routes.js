const fs = require('fs');
const file = fs.readFileSync('.next/dev/types/routes.d.ts', 'utf-8');
const lines = file.split('\n');

for (let i = 60; i < 75; i++) {
  if (lines[i] && lines[i].includes('ional/teachers/basic-info')) {
    console.log('--- LINE ' + i + ' ---');
    console.log(lines[i].substring(0, 150));
    
    // Check previous lines for where the string started
    console.log('--- PREVIOUS LINE ---');
    console.log(lines[i-1]);
  }
}
