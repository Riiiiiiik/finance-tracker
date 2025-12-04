from PIL import Image
import os

# Path to the generated image
image_path = r"C:\Users\Rik\.gemini\antigravity\brain\9fcbd2c9-cdb5-421f-8de8-8ec0bda9c7dc\monkey_avatars_pack_1764714797168.png"
output_dir = r"c:\Users\Rik\Editores Albertis\finance-tracker\app\public\avatars"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

try:
    img = Image.open(image_path)
    width, height = img.size
    
    # Assuming a 3x2 grid based on the prompt "set of 6"
    # Adjust these values if the grid is different
    rows = 2
    cols = 3
    
    w = width // cols
    h = height // rows
    
    count = 1
    for r in range(rows):
        for c in range(cols):
            left = c * w
            top = r * h
            right = left + w
            bottom = top + h
            
            # Crop the image
            cropped_img = img.crop((left, top, right, bottom))
            
            # Save the cropped image
            output_path = os.path.join(output_dir, f"monkey_{count}.png")
            cropped_img.save(output_path)
            print(f"Saved {output_path}")
            count += 1
            
except Exception as e:
    print(f"Error: {e}")
