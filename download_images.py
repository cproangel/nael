import os
import urllib.request
import json
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

urls = [
  { "id": 1, "url": "https://progress-msk.ru/image/cache/catalog/products/upload/iblock/fff/02-1200x1200.jpg" },
  { "id": 2, "url": "https://jbi37.ru/image/cache/catalog/image_tovar/kolza/plitadnischapd_10_zhelezobeton-1024x768.png" },
  { "id": 3, "url": "https://gbi.ru/upload/iblock/926/wgqquaz392u6dk9n9rn9f5xszl2587ut.jpg" },
  { "id": 4, "url": "https://www.rusgbi.ru/uploads/goods/65a2969c1cf1c.png" },
  { "id": 5, "url": "https://www.uralstroybaza.ru/wp-content/uploads/2021/01/Kolco-opornoe-zhelezobetonnoe-3.jpg" },
  { "id": 6, "url": "https://ozjbk.by/wp-content/uploads/2014/12/%D0%9F%D0%A2%D0%9C.jpg" },
  { "id": 7, "url": "https://gbi-psk.ru/wp-content/uploads/2024/02/sv3.jpg" },
  { "id": 8, "url": "https://gbi.ru/upload/iblock/62c/62c55fd583be1cba6d4e15a129b615f3.jpg" },
  { "id": 9, "url": "https://esagbi.ru/files/gallery/1057/big/asenot_1706541184_1709820926.jpg" },
  { "id": 10, "url": "https://st-par.ru/upload/iblock/1ba/86fbee387f0211ee82d9005056af8669_86fbf1377f0211ee82d9005056af8669.jpg" },
  { "id": 11, "url": "https://www.rusgbi.ru/uploads/goods/658b02fe9690e.png" }
]

os.makedirs('images', exist_ok=True)

opener = urllib.request.build_opener()
opener.addheaders = [('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')]
urllib.request.install_opener(opener)

for item in urls:
    ext = item["url"].split('.')[-1]
    if len(ext) > 4:
        ext = 'jpg'
    filename = f"images/{item['id']}.jpg"
    print(f"Downloading {item['id']}...")
    try:
        urllib.request.urlretrieve(item["url"], filename)
        print(f"Saved {filename}")
    except Exception as e:
        print(f"Failed to download {item['id']}: {e}")
