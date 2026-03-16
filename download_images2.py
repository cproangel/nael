import os
import urllib.request
from urllib.parse import quote
import json
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

urls = [
  { "id": 1, "name": "Бетонный колодец", "url": "https://cdn-img.birbir.uz/i/800x800-fit/files/cd/a2/87852374beb661e903f5c4f28e64.jpg" },
  { "id": 2, "name": "Дно колодца ЖБИ (поддон)", "url": "https://yarkolco.ru/wp-content/uploads/2025/11/betonnoye-dno-kolodtsa.jpg" },
  { "id": 3, "name": "Плита перекрытия ЖБИ", "url": "https://okgbi.ru/upload/medialibrary/ab7/bm7h6xwx5qmgqmetke237zgjxofsp5wj/plita_perekrytia_ghelezobetonnay_pb_ochekovskiy_kombinat_gbi.jpg" },
  { "id": 4, "name": "Блок колодезный (БК)", "url": "https://stroy-dostavka.ru/upload/iblock/c2f/betonnyi_kolodets.jpg" }, # Replaced 404 URL
  { "id": 5, "name": "Опорное кольцо ЖБИ (БДО)", "url": "https://st20.stpulscen.ru/images/product/316/333/285_original.jpg" },
  { "id": 6, "name": "Плита перекрытия многопустотная (ПТМ)", "url": "https://goldspektr.by/wp-content/uploads/2021/08/птм-бу-1.jpg" },
  { "id": 7, "name": "Свая забивная ЖБИ (на стройке)", "url": "https://bazagbi.ru/wp-content/uploads/2018/05/Сваи-40х40.jpeg" },
  { "id": 8, "name": "Фундаментный блок сплошной (ФБС)", "url": "https://ekoyar.ru/upload/stati/FBS1.jpg" },
  { "id": 9, "name": "Лоток кабельного канала ЖБИ (УБКМ)", "url": "https://pkf-st.ru/d/vodoot_33ad8505f1eea34232a29fcee0bbd05b_1.jpg" },
  { "id": 10, "name": "Плита дорожная ЖБИ", "url": "https://msm62.ru/upload/medialibrary/900/900f6c243763f350c2a29fcee0bbd05b.jpg" },
  { "id": 11, "name": "Труба железобетонная безнапорная", "url": "https://kzmc.uz/media/uploads/images/load/jelezobetonnie_beznapornie_trubi_1.jpg" }
]

os.makedirs('images', exist_ok=True)

opener = urllib.request.build_opener()
opener.addheaders = [('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')]
urllib.request.install_opener(opener)

for item in urls:
    filename = f"images/{item['id']}.jpg"
    print(f"Downloading {item['id']}...")
    try:
        # handle cyrillic chars
        escaped_url = quote(item["url"], safe=':/')
        urllib.request.urlretrieve(escaped_url, filename)
        print(f"Saved {filename}")
    except Exception as e:
        print(f"Failed to download {item['id']}: {e}")
