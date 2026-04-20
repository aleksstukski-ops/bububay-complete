#!/usr/bin/env python3
"""
BubuBay App Icon Generator
Generates all required icon sizes with a dark gradient background and BB branding.
"""

import os
from PIL import Image, ImageDraw, ImageFont

# Output directory
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "assets", "icons")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Colors
BG_COLOR = (15, 23, 42)       # #0f172a
GRADIENT_START = (30, 64, 175) # #1e40af
TEXT_COLOR = (255, 255, 255)   # white

# Required sizes
SIZES = [1024, 512, 256, 192, 128, 96, 72, 48]


def draw_gradient_circle(draw, cx, cy, radius, color_inner, color_outer, steps=200):
    """Draw a radial gradient circle."""
    for i in range(steps, 0, -1):
        r = int(radius * i / steps)
        t = i / steps  # 1 = outer, 0 = inner
        ri = int(color_inner[0] * (1 - t) + color_outer[0] * t)
        gi = int(color_inner[1] * (1 - t) + color_outer[1] * t)
        bi = int(color_inner[2] * (1 - t) + color_outer[2] * t)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(ri, gi, bi))


def generate_icon(size):
    img = Image.new("RGBA", (size, size), BG_COLOR + (255,))
    draw = ImageDraw.Draw(img)

    cx, cy = size // 2, size // 2
    radius = int(size * 0.42)

    # Draw radial gradient circle (glow effect)
    draw_gradient_circle(draw, cx, cy, radius, GRADIENT_START, BG_COLOR)

    # Draw "BB" text centered
    text = "BB"
    font_size = int(size * 0.38)

    font = None
    font_paths = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFCompact.ttf",
        "/Library/Fonts/Arial Bold.ttf",
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                font = ImageFont.truetype(fp, font_size)
                break
            except Exception:
                pass

    if font is None:
        font = ImageFont.load_default()

    # Get text bounding box
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = cx - tw // 2 - bbox[0]
    ty = cy - th // 2 - bbox[1]

    # Draw subtle shadow
    shadow_offset = max(1, size // 128)
    draw.text((tx + shadow_offset, ty + shadow_offset), text, font=font,
              fill=(0, 0, 0, 120))

    # Draw main text
    draw.text((tx, ty), text, font=font, fill=TEXT_COLOR)

    return img


def main():
    print("🐻 BubuBay Icon Generator")
    print(f"Output: {OUTPUT_DIR}")
    print()

    for size in SIZES:
        img = generate_icon(size)
        filename = f"icon-{size}.png"
        path = os.path.join(OUTPUT_DIR, filename)
        img.save(path, "PNG")
        print(f"  ✅ {filename} ({size}x{size})")

    # Also copy the 1024px as the main icon and adaptive icon
    icon_1024 = generate_icon(1024)
    for dest_name in ["icon.png", "adaptive-icon.png", "splash-icon.png"]:
        dest_path = os.path.join(os.path.dirname(__file__), "assets", dest_name)
        if dest_name == "splash-icon.png":
            # Splash can be slightly different — use 512px centered on 1024 canvas
            splash = Image.new("RGBA", (1024, 1024), BG_COLOR + (255,))
            icon_512 = generate_icon(512)
            offset = (1024 - 512) // 2
            splash.paste(icon_512, (offset, offset))
            splash.save(dest_path, "PNG")
        else:
            icon_1024.save(dest_path, "PNG")
        print(f"  ✅ assets/{dest_name} (updated)")

    print()
    print("Done! All icons generated.")


if __name__ == "__main__":
    main()
