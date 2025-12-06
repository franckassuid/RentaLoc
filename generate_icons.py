from PIL import Image, ImageOps

# Config
bg_color = "#0f172a"
source_path = "public/logo.png"
sizes = [
    ("public/pwa-192x192.png", 192),
    ("public/pwa-512x512.png", 512),
    ("public/apple-touch-icon.png", 180) # Standard iOS size
]

try:
    # Load source
    img = Image.open(source_path).convert("RGBA")
    
    # Calculate safe zone sizing (approx 65-70% of total size to be safe for circle masks)
    # But we want it large enough to look good. 60% padding is improved.
    # Actually, Android Adaptive Icons mask is circle d=72dp inside 108dp square. 
    # Safe zone is center 66%.
    
    for path, size in sizes:
        # Create solid background
        canvas = Image.new("RGBA", (size, size), bg_color)
        
        # Calculate logo size (70% of canvas)
        logo_size = int(size * 0.7)
        
        # Resize logo keeping aspect ratio
        logo_copy = img.copy()
        logo_copy.thumbnail((logo_size, logo_size), Image.Resampling.LANCZOS)
        
        # Center logo
        x = (size - logo_copy.width) // 2
        y = (size - logo_copy.height) // 2
        
        # Paste logo using its alpha channel as mask
        canvas.paste(logo_copy, (x, y), logo_copy)
        
        # Save
        canvas.save(path)
        print(f"Generated {path}")

except Exception as e:
    print(f"Error: {e}")
