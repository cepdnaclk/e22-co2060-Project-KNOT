from PIL import Image

def process_image(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    # More aggressive threshold for black/dark colors
    for item in data:
        if item[0] < 50 and item[1] < 50 and item[2] < 50:
            new_data.append((255, 255, 255, 0))
        else:
            # Make sure it's fully opaque if it's not transparent
            new_data.append((item[0], item[1], item[2], 255))
            
    img.putdata(new_data)
    
    # Get bounding box from the alpha channel to ignore RGB noise in transparent areas
    alpha = img.split()[-1]
    bbox = alpha.getbbox()
    print("Original size:", img.size)
    print("Bounding box:", bbox)
    
    if bbox:
        img = img.crop(bbox)
        print("Cropped size:", img.size)
        
    img.save(output_path, "PNG")

if __name__ == "__main__":
    process_image("knot_logo.png", "knot_logo_cropped.png")
