import os
import subprocess
import concurrent.futures
import urllib.request
import json
import re

ASSETS = {
    # Video
    "hero_video.mp4": {
        "model": "wan2_7",
        "params": ["--prompt", "Luxury mechanical watch rotating slowly on black silk fabric, anamorphic lens flare, volumetric gold particle dust floating, deep shadow, cinematic 4K, slow motion, dark background, no text", "--duration", "5"]
    },
    # Images
    "hero_still.png": {
        "model": "flux_2",
        "params": ["--prompt", "Luxury mechanical watch rotating slowly on black silk fabric, anamorphic lens flare, volumetric gold particle dust floating, deep shadow, cinematic 4K, dark background, no text", "--aspect_ratio", "16:9"]
    },
    "workshop.png": {
        "model": "flux_2",
        "params": ["--prompt", "Master watchmaker's hands holding a mechanical movement under a loupe, Geneva atelier, golden hour light through rain-streaked window, shallow depth of field, film grain, no face visible", "--aspect_ratio", "16:9"]
    },
    "macro_crystal.png": {
        "model": "flux_2",
        "params": ["--prompt", "Extreme close-up of sapphire watch crystal with anti-reflective coating, multiple light refractions, ultra-macro photography, black background, photorealistic", "--aspect_ratio", "1:1"]
    },
    "macro_dial.png": {
        "model": "flux_2",
        "params": ["--prompt", "Sunburst guilloche watch dial pattern, extreme macro, raking directional light revealing texture, silver and champagne tones, ultra-sharp, studio lighting", "--aspect_ratio", "1:1"]
    },
    "macro_case.png": {
        "model": "flux_2",
        "params": ["--prompt", "Brushed titanium case edge with chamfered bevel catching light, extreme macro, watchmaking precision, black background, photorealistic", "--aspect_ratio", "1:1"]
    },
    "macro_markers.png": {
        "model": "flux_2",
        "params": ["--prompt", "Hand-applied blued steel hour markers in situ, close-up watch dial, metallic finish, premium craftsmanship, photorealistic", "--aspect_ratio", "1:1"]
    },
    "lifestyle_black_tie.png": {
        "model": "flux_2",
        "params": ["--prompt", "Luxury watch on wrist at black-tie gala, candlelight bokeh background, tuxedo cuff, shallow depth of field, elegant and cinematic", "--aspect_ratio", "1:1"]
    },
    "lifestyle_yacht.png": {
        "model": "flux_2",
        "params": ["--prompt", "Luxury watch on wrist against yacht deck railing, ocean horizon, golden afternoon light, casual luxury, photorealistic", "--aspect_ratio", "1:1"]
    },
    "archive_1923.png": {
        "model": "flux_2",
        "params": ["--prompt", "Vintage 1920s watchmaker's workshop, antique tools on wooden workbench, sepia-adjacent color grade, aged photograph aesthetic, soft diffused light", "--aspect_ratio", "16:9"]
    },
    "archive_1961.png": {
        "model": "flux_2",
        "params": ["--prompt", "Vintage 1960s watch prototype diagram and metal parts on workshop bench, aged photograph aesthetic, soft warm light", "--aspect_ratio", "16:9"]
    },
    "archive_1984.png": {
        "model": "flux_2",
        "params": ["--prompt", "Vintage 1980s watchmaker drafting first titanium case design, technical blueprints, film grain, warm nostalgic lighting", "--aspect_ratio", "16:9"]
    },
    "archive_2024.png": {
        "model": "flux_2",
        "params": ["--prompt", "Modern state of the art cleanroom watch manufacture floor, robotic assembly lines, high-tech watchmakers at work, sterile blue and white lighting", "--aspect_ratio", "16:9"]
    },
    "footer_bg.png": {
        "model": "flux_2",
        "params": ["--prompt", "Luxury watch resting on polished black marble slab, single candle blurred out of focus in background, extreme depth of field, cinematic dark mood, no text", "--aspect_ratio", "16:9"]
    },
    "gear_blur.png": {
        "model": "flux_2",
        "params": ["--prompt", "Abstract close-up of brass watch gears in motion, motion blur, dark gold and black palette, bokeh, artistic macro photography", "--aspect_ratio", "16:9"]
    },
    # Swatches
    "swatch_alligator.png": {
        "model": "flux_2",
        "params": ["--prompt", "Extreme close-up of black alligator leather strap texture, premium quality leather grain, studio lighting, photorealistic", "--aspect_ratio", "1:1"]
    },
    "swatch_calfskin.png": {
        "model": "flux_2",
        "params": ["--prompt", "Extreme close-up of tan calfskin leather strap texture, smooth luxury leather, studio lighting, photorealistic", "--aspect_ratio", "1:1"]
    },
    "swatch_steel.png": {
        "model": "flux_2",
        "params": ["--prompt", "Extreme close-up of brushed steel watch bracelet links, metallic texture, light reflection, studio lighting, photorealistic", "--aspect_ratio", "1:1"]
    },
    "swatch_titanium.png": {
        "model": "flux_2",
        "params": ["--prompt", "Extreme close-up of titanium mesh watch bracelet, woven metal wire, studio lighting, photorealistic", "--aspect_ratio", "1:1"]
    },
    "swatch_nato.png": {
        "model": "flux_2",
        "params": ["--prompt", "Extreme close-up of dark green NATO fabric nylon strap weave, textured threads, studio lighting, photorealistic", "--aspect_ratio", "1:1"]
    },
    "swatch_rubber.png": {
        "model": "flux_2",
        "params": ["--prompt", "Extreme close-up of premium black matte sport rubber strap texture, clean finish, studio lighting, photorealistic", "--aspect_ratio", "1:1"]
    }
}

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "assets"))

def generate_and_download(filename, config):
    filepath = os.path.join(OUTPUT_DIR, filename)
    if os.path.exists(filepath):
        print(f"[SKIPPED] {filename} already exists.")
        return filename, filepath

    print(f"[START] Generating {filename} with model {config['model']}...")
    try:
        # Build the command
        cmd = ["higgsfield", "generate", "create", config["model"]] + config["params"] + ["--wait"]
        
        # Run command
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        stdout = result.stdout
        
        # Search for URLs in output
        urls = re.findall(r'https?://[^\s\n]+', stdout)
        if not urls:
            raise Exception(f"No URL found in CLI output:\n{stdout}")
            
        url = urls[-1].strip()
        print(f"[DOWNLOAD] Downloading {filename} from {url}...")
        
        # Download and save
        urllib.request.urlretrieve(url, filepath)
        print(f"[SUCCESS] Saved {filename} to {filepath}")
        return filename, filepath
    except Exception as e:
        print(f"[ERROR] Failed to generate/download {filename}: {str(e)}")
        # Check stderr
        if 'result' in locals() and result.stderr:
            print(f"Stderr: {result.stderr}")
        return filename, None

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Target assets directory: {OUTPUT_DIR}")
    
    # Run in parallel using ThreadPoolExecutor (max 4 concurrent jobs to avoid overloading or CLI issues)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(generate_and_download, name, conf): name for name, conf in ASSETS.items()}
        for future in concurrent.futures.as_completed(futures):
            name = futures[future]
            try:
                name, path = future.result()
                if path:
                    print(f"[FINISHED] {name} -> {path}")
                else:
                    print(f"[FAILED] {name}")
            except Exception as exc:
                print(f"[EXCEPTION] {name} generated an exception: {exc}")

if __name__ == "__main__":
    main()
