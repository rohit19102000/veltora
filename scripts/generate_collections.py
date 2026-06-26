import os
import subprocess
import concurrent.futures
import urllib.request
import re

ASSETS = {
    "collection_noir.png": {
        "model": "flux_2",
        "params": ["--prompt", "Luxury mechanical watch resting on matte black stone slab, dark obsidian vibe, photorealistic, no text", "--aspect_ratio", "1:1"]
    },
    "collection_soleil.png": {
        "model": "flux_2",
        "params": ["--prompt", "Luxury mechanical watch resting on weathered brass plate, gold sunburst light reflection, photorealistic, no text", "--aspect_ratio", "1:1"]
    },
    "collection_abyssal.png": {
        "model": "flux_2",
        "params": ["--prompt", "Luxury diver mechanical watch resting on a dark wet ocean-textured rock surface, volumetric water droplets, photorealistic, no text", "--aspect_ratio", "1:1"]
    },
    "collection_regency.png": {
        "model": "flux_2",
        "params": ["--prompt", "Luxury classic mechanical watch resting on aged parchment paper sheet, warm elegant studio lighting, photorealistic, no text", "--aspect_ratio", "1:1"]
    },
    "collection_strato.png": {
        "model": "flux_2",
        "params": ["--prompt", "Luxury racing mechanical watch resting on brushed carbon fiber sheet, technical futuristic vibe, photorealistic, no text", "--aspect_ratio", "1:1"]
    },
    "collection_aurora.png": {
        "model": "flux_2",
        "params": ["--prompt", "Luxury mechanical watch resting on frosted glass with colored aurora light casting from beneath, futuristic cyan and violet tones, photorealistic, no text", "--aspect_ratio", "1:1"]
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
        cmd = ["higgsfield", "generate", "create", config["model"]] + config["params"] + ["--wait"]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        stdout = result.stdout
        
        urls = re.findall(r'https?://[^\s\n]+', stdout)
        if not urls:
            raise Exception(f"No URL found in CLI output:\n{stdout}")
            
        url = urls[-1].strip()
        print(f"[DOWNLOAD] Downloading {filename} from {url}...")
        
        urllib.request.urlretrieve(url, filepath)
        print(f"[SUCCESS] Saved {filename} to {filepath}")
        return filename, filepath
    except Exception as e:
        print(f"[ERROR] Failed to generate/download {filename}: {str(e)}")
        if 'result' in locals() and result.stderr:
            print(f"Stderr: {result.stderr}")
        return filename, None

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Target collections directory: {OUTPUT_DIR}")
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
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
