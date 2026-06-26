#!/usr/bin/env python3
import sys
import os
from PIL import Image, ImageChops

def remove_background(input_path, output_path, low_thresh=18, high_thresh=55):
    print(f"Processing background for: {input_path}")
    try:
        # Load image and convert to RGBA
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()
        
        new_data = []
        for item in datas:
            r, g, b, a = item
            # Calculate brightness/intensity of the pixel
            brightness = max(r, g, b)
            
            if brightness <= low_thresh:
                # Completely transparent
                new_data.append((r, g, b, 0))
            elif brightness >= high_thresh:
                # Completely opaque
                new_data.append((r, g, b, 255))
            else:
                # Soft transition linear interpolation
                alpha = int(255 * (brightness - low_thresh) / (high_thresh - low_thresh))
                new_data.append((r, g, b, alpha))
                
        img.putdata(new_data)
        
        # Get bounding box of non-transparent content
        # To do this, we get the alpha channel
        alpha_channel = img.split()[3]
        bbox = alpha_channel.getbbox()
        
        if bbox:
            left, top, right, bottom = bbox
            width = right - left
            height = bottom - top
            
            # Find center of the content
            cx = (left + right) / 2
            cy = (top + bottom) / 2
            
            # Find maximum dimension and add a 5% margin padding
            max_dim = max(width, height) * 1.05
            
            # Create a new square bounding box centered around the content's center
            half_dim = max_dim / 2
            new_left = int(max(0, cx - half_dim))
            new_top = int(max(0, cy - half_dim))
            new_right = int(min(img.width, cx + half_dim))
            new_bottom = int(min(img.height, cy + half_dim))
            
            # Crop to the centered square
            cropped = img.crop((new_left, new_top, new_right, new_bottom))
            
            # Make sure it's a perfect square (pad if clipped by image borders)
            square_size = max(cropped.width, cropped.height)
            square_img = Image.new("RGBA", (square_size, square_size), (0, 0, 0, 0))
            
            # Paste cropped image into center of the transparent square
            offset_x = (square_size - cropped.width) // 2
            offset_y = (square_size - cropped.height) // 2
            square_img.paste(cropped, (offset_x, offset_y))
            
            # Resize to a clean standard size (e.g. 600x600 px) for performance and consistency
            final_img = square_img.resize((600, 600), Image.Resampling.LANCZOS)
        else:
            final_img = img.resize((600, 600), Image.Resampling.LANCZOS)
            
        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Save as transparent PNG
        final_img.save(output_path, "PNG")
        print(f"[SUCCESS] Saved transparent centered PNG to: {output_path}")
        return True
    except Exception as e:
        print(f"[ERROR] Background removal failed for {input_path}: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: remove_background.py <input_image_path> <output_image_path>")
        sys.exit(1)
        
    input_img = sys.argv[1]
    output_img = sys.argv[2]
    remove_background(input_img, output_img)
