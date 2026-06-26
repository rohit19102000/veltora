#!/usr/bin/env python3
import os
import subprocess
import urllib.request
import re
import sys

# Import the background remover function
from remove_background import remove_background

# Caliber parts with their Higgsfield Flux 2 generation prompts
CALIBER_ASSETS = {
    "caliber_rotor": "Luxury mechanical watch automatic winding rotor weight, silver metallic finish, Cotes de Geneve circular engraving, isolated on solid black background, studio lighting, photorealistic, 8k, no text",
    "caliber_bridge": "Luxury mechanical watch bridge structure, brushed metal plate with ruby bearings, gears showing underneath, isolated on solid black background, studio lighting, photorealistic, 8k, no text",
    "caliber_balance": "Luxury mechanical watch balance wheel, brass alloy, with spiral hairspring, fine watchmaking component, isolated on solid black background, studio lighting, photorealistic, 8k, no text",
    "caliber_gears": "Luxury mechanical watch gear train, golden brass gears and steel pinion assemblies, isolated on solid black background, studio lighting, photorealistic, 8k, no text",
    "caliber_mainplate": "Luxury mechanical watch mainplate, dark gunmetal circular base plate, circular graining texture, isolated on solid black background, studio lighting, photorealistic, 8k, no text"
}

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "assets"))

def generate_and_process(name, prompt):
    raw_filename = f"{name}_raw.png"
    raw_filepath = os.path.join(OUTPUT_DIR, raw_filename)
    final_filepath = os.path.join(OUTPUT_DIR, f"{name}.png")
    
    print(f"\n--- [START] Generating Caliber Part: {name} ---")
    print(f"Prompt: {prompt}")
    
    try:
        # Construct the higgsfield generate CLI command
        cmd = [
            "higgsfield", "generate", "create", "flux_2",
            "--prompt", prompt,
            "--aspect_ratio", "1:1",
            "--wait"
        ]
        
        # Run command and capture output
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        stdout = result.stdout
        
        # Search for download URL in the output
        urls = re.findall(r'https?://[^\s\n]+', stdout)
        if not urls:
            raise Exception(f"No URL found in Higgsfield CLI output:\n{stdout}")
            
        url = urls[-1].strip()
        print(f"[DOWNLOAD] Downloading raw file for {name} from: {url}")
        
        # Download the file to raw_filepath
        urllib.request.urlretrieve(url, raw_filepath)
        print(f"[DOWNLOAD SUCCESS] Saved raw image to {raw_filepath}")
        
        # Process the background to make it transparent and centered
        success = remove_background(raw_filepath, final_filepath)
        
        # Clean up the raw file to save space
        if success and os.path.exists(raw_filepath):
            os.remove(raw_filepath)
            print(f"[CLEANUP] Removed temporary raw file: {raw_filepath}")
            
        print(f"--- [FINISHED] Caliber Part: {name} completed ---\n")
        return True
    except Exception as e:
        print(f"[ERROR] Generation/Processing failed for {name}: {e}")
        if 'result' in locals() and result.stderr:
            print(f"Command Stderr: {result.stderr}")
        return False

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Output directory for assets: {OUTPUT_DIR}")
    
    success_count = 0
    for name, prompt in CALIBER_ASSETS.items():
        if generate_and_process(name, prompt):
            success_count += 1
            
    print(f"Generated {success_count}/{len(CALIBER_ASSETS)} caliber assets successfully.")
    if success_count == len(CALIBER_ASSETS):
        print("All caliber assets generated successfully!")
        sys.exit(0)
    else:
        print("Some caliber assets failed to generate.")
        sys.exit(1)

if __name__ == "__main__":
    main()
