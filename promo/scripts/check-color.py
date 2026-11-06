from PIL import Image
from collections import Counter
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]/'output'/'qa'
dominants=[]
for name,box in [('frame-40-5.png',(70,570,470,690)),('encoded-ending.png',(140,1140,940,1380))]:
    im=Image.open(root/name).convert('RGB').crop(box)
    colors=Counter(c for c in getattr(im, 'get_flattened_data', im.getdata)() if c[1]>170 and c[0]<100)
    print(name,colors.most_common(3))
    dominants.append(colors.most_common(1)[0][0])
error=max(abs(a-b) for a,b in zip(*dominants))
report={'referenceRGB':dominants[0],'encodedRGB':dominants[1],'maximumChannelError':error,'passed':error<=5}
(root/'color-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
if not report['passed']:
    raise SystemExit('Encoded palette differs from the preview.')
