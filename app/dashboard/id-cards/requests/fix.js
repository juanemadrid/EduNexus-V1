
const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\JoshuaGamingTV\\.gemini\\antigravity\\scratch\\edunexus-master\\app\\dashboard\\institutional\\id-cards\\requests\\page.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\\n');

// Line 520 (index 519)
if (lines[519].includes('style={{ position:') && lines[519].includes("overflow: 'hidden' }}") && !lines[519].includes('>')) {
    lines[519] = lines[519].trimEnd() + '>';
}

// Line 548 (index 547)
if (lines[547].includes('</div>') && lines[547].trim() === '</div>') {
    lines[547] = 'REPLACE_ME_DELETE';
}

const newContent = lines.filter(l => l !== 'REPLACE_ME_DELETE').join('\\n');
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully patched page.tsx via Node');
