import urllib.request
import ssl

ssl._create_default_https_context = ssl._create_unverified_context
opener = urllib.request.build_opener()
opener.addheaders = [('User-Agent', 'Mozilla/5.0')]
urllib.request.install_opener(opener)

url = 'https://doski.ru/i/05/26/3394465.jpg'
urllib.request.urlretrieve(url, 'images/4.jpg')
print("Downloaded 4.jpg")
