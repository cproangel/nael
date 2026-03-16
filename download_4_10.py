import urllib.request
import ssl

ssl._create_default_https_context = ssl._create_unverified_context
opener = urllib.request.build_opener()
opener.addheaders = [('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')]
urllib.request.install_opener(opener)

urls = {
  "4": "https://zavodzhbispb.ru/wp-content/uploads/IMG_0604.jpg",
  "10": "https://evrocontract.ru/wp-content/uploads/2019/09/montaz-doroznih-plit.jpg"
}

for id, url in urls.items():
    try:
        urllib.request.urlretrieve(url, f'images/{id}.jpg')
        print(f"Downloaded {id}.jpg")
    except Exception as e:
        print(f"Failed {id}.jpg: {e}")
