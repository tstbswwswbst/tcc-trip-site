"""Create distributable skill, WorkBuddy variant and ready-to-open demo ZIPs."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib

root = Path(__file__).resolve().parents[1]
output = root / 'releases'
output.mkdir(exist_ok=True)
skill = root / 'skills' / 'trip-site'

def pack_skill(name, workbuddy=False):
    with ZipFile(output / name, 'w', ZIP_DEFLATED) as z:
        for file in sorted(skill.rglob('*')):
            if not file.is_file():
                continue
            data = file.read_bytes()
            if workbuddy and file.name == 'SKILL.md':
                text = data.decode('utf-8')
                extra = ('\ndisplay_name: 旅行网站 Trip Site\n'
                         'description_zh: 将旅行资料生成精美交互网站和随身摘要\n'
                         'description_en: Turn travel notes into an interactive trip website and companion card\n'
                         'version: 1.0.0\nauthor: TCC\n')
                end = text.index('\n---', 3)
                text = text[:end] + extra.rstrip('\n') + text[end:]
                data = text.encode('utf-8')
            z.writestr('trip-site/' + file.relative_to(skill).as_posix(), data)

pack_skill('trip-site-skill.zip')
pack_skill('trip-site-workbuddy.zip', True)
with ZipFile(output / 'trip-site-demo.zip', 'w', ZIP_DEFLATED) as z:
    for file in sorted((root / 'demo').iterdir()):
        if file.is_file():
            z.write(file, 'trip-site-demo/' + file.name)
checks = []
for file in sorted(output.glob('*.zip')):
    with ZipFile(file) as z:
        assert z.testzip() is None
    checks.append(hashlib.sha256(file.read_bytes()).hexdigest() + '  ' + file.name)
(output / 'SHA256SUMS.txt').write_text('\n'.join(checks) + '\n', encoding='utf-8')
print('\n'.join(checks))
