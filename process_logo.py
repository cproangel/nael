from PIL import Image

try:
    img = Image.open(r"C:\Project\nael\foto\logo.jpg").convert("RGBA")
    datas = img.getdata()

    new_data = []
    # Remove white background, keep logo and turn it white
    for item in datas:
        if item[0] > 200 and item[1] > 200 and item[2] > 200:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append((255, 255, 255, 255))

    img.putdata(new_data)

    # Crop the bottom 30% where the text usually is
    w, h = img.size
    cropped = img.crop((0, 0, w, int(h * 0.7)))

    # Crop to the exact bounding box of the remaining icon
    bbox = cropped.getbbox()
    if bbox:
        cropped = cropped.crop(bbox)

    cropped.save(r"C:\Project\nael\foto\logo_icon.png", "PNG")
    print("SUCCESS: Saved logo_icon.png")
except Exception as e:
    print(f"ERROR: {e}")
