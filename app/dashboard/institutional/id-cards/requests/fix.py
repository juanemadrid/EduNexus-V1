
import os

path = r'c:\Users\JoshuaGamingTV\.gemini\antigravity\scratch\edunexus-master\app\dashboard\institutional\id-cards\requests\page.tsx'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix Line 520 (Index 519) - add closing '>'
if 'style={{ position:' in lines[519] and 'overflow: \'hidden\' }}' in lines[519] and '>' not in lines[519]:
    lines[519] = lines[519].rstrip() + ">\n"

# Fix Line 521 (Index 520) - ensure it's not starting with an extra div if it was broken
# (The previous view_file showed 521 was the start of the inner div)

# Fix Line 548 (Index 547) - remove redundant </div>
if '</div>' in lines[547] and '            ' in lines[547]:
    lines[547] = ""

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Successfully patched page.tsx")
