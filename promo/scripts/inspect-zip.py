import zipfile
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

archive = Path(r'C:\Users\29235\OneDrive - Institute of Business Administration\WhatsApp Unknown 2026-11-03 at 2.57.33 AM.zip')
with zipfile.ZipFile(archive) as z:
    output = Path(__file__).resolve().parents[1] / 'assets' / 'app'
    output.mkdir(parents=True, exist_ok=True)
    sheet = Image.new('RGB', (1280, 4 * 520), '#202827')
    draw = ImageDraw.Draw(sheet)
    for index, item in enumerate(z.infolist()):
        print(f'{item.filename} | {item.file_size}')
        target = output / f'{index+1:02d}.jpg'
        target.write_bytes(z.read(item))
        with Image.open(target) as im:
            print(f'  {target.name}: {im.size}')
            thumb = ImageOps.contain(im, (300, 475))
            x, y = (index % 4) * 320, (index // 4) * 520
            sheet.paste(thumb, (x + (320-thumb.width)//2, y+28))
            draw.text((x+12, y+7), f'{index+1:02d} / {im.width} x {im.height}', fill='white')
    sheet.save(output / 'contact-sheet.jpg')
