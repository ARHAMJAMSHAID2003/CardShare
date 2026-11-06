import hashlib
import json
import zipfile
from pathlib import Path

root = Path(__file__).resolve().parents[1]
archive = Path(r'C:\Users\29235\OneDrive - Institute of Business Administration\WhatsApp Unknown 2026-11-03 at 2.57.33 AM.zip')
entries = []
with zipfile.ZipFile(archive) as z:
    for index, item in enumerate(z.infolist()):
        filename = f'{index+1:02d}.jpg'
        source = z.read(item)
        copy = (root / 'assets' / 'app' / filename).read_bytes()
        entries.append({'file': filename, 'original': item.filename,
                        'sha256': hashlib.sha256(source).hexdigest(),
                        'byteIdentical': copy == source})
manifest = {'archive': archive.name, 'dimensions': [720, 1600], 'files': entries}
(root / 'assets' / 'app' / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
qa = root / 'output' / 'qa'
qa.mkdir(parents=True, exist_ok=True)
report = {'count': len(entries), 'passed': all(e['byteIdentical'] for e in entries), 'files': entries}
(qa / 'source-audit.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(f"{len(entries)} source screenshots: byte-identical={report['passed']}")
if not report['passed']:
    raise SystemExit(1)
