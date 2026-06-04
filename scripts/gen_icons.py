"""Generate favicon / app icons / OG card from the VietDon logo.
Run: python scripts/gen_icons.py
Outputs into public/.
"""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public")
SRC_LOGO = os.path.join(PUB, "logo.png")
SRC_AVATAR = os.path.join(ROOT, "src", "data", "images", "avatar.png")

logo = Image.open(SRC_LOGO).convert("RGBA")

# Make the logo a perfect square (pad transparent) to avoid squishing.
w, h = logo.size
side = max(w, h)
square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
square.paste(logo, ((side - w) // 2, (side - h) // 2), logo)


def save_png(size, name):
    img = square.resize((size, size), Image.LANCZOS)
    img.save(os.path.join(PUB, name))
    print("wrote", name, size)


# --- favicon.ico (multi-resolution) ---
ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
square.resize((256, 256), Image.LANCZOS).save(
    os.path.join(PUB, "favicon.ico"), sizes=ico_sizes
)
print("wrote favicon.ico", ico_sizes)

# --- PNG icons ---
save_png(16, "favicon-16x16.png")
save_png(32, "favicon-32x32.png")
save_png(180, "apple-touch-icon.png")
save_png(192, "icon-192.png")
save_png(512, "icon-512.png")

# --- OG / social card 1200x630 ---
W, H = 1200, 630
# Sample logo gradient corners for a matching background.
small = logo.resize((10, 10), Image.LANCZOS).convert("RGB")
c_tl = small.getpixel((1, 1))
c_br = small.getpixel((8, 8))

og = Image.new("RGB", (W, H), c_tl)
# vertical-ish diagonal gradient between the two sampled colors
for y in range(H):
    t = y / (H - 1)
    r = int(c_tl[0] * (1 - t) + c_br[0] * t)
    g = int(c_tl[1] * (1 - t) + c_br[1] * t)
    b = int(c_tl[2] * (1 - t) + c_br[2] * t)
    ImageDraw.Draw(og).line([(0, y), (W, y)], fill=(r, g, b))

# white rounded panel for contrast
draw = ImageDraw.Draw(og, "RGBA")
draw.rounded_rectangle([40, 40, W - 40, H - 40], radius=40, fill=(255, 255, 255, 235))

# logo on the left
logo_size = 300
lg = square.resize((logo_size, logo_size), Image.LANCZOS)
og.paste(lg, (95, (H - logo_size) // 2), lg)

# text on the right
def font(path, size):
    return ImageFont.truetype(os.path.join("C:/Windows/Fonts", path), size)

name_f = font("arialbd.ttf", 72)
role_f = font("arial.ttf", 40)
sub_f = font("arial.ttf", 32)

tx = 440
dark = (28, 30, 34)
muted = (90, 96, 104)
accent = (31, 138, 76)  # logo green, readable on the light panel

draw.text((tx, 215), "Mai Quốc Việt", font=name_f, fill=dark)
draw.text((tx, 305), "Backend Developer", font=role_f, fill=accent)
draw.text((tx, 370), "VietDon · Python · Django · FastAPI", font=sub_f, fill=muted)
draw.text((tx, 415), "Đà Nẵng, Việt Nam", font=sub_f, fill=muted)

og.save(os.path.join(PUB, "og-image.png"), optimize=True)
print("wrote og-image.png", (W, H), "bg", c_tl, "->", c_br)

# --- avatar copy for JSON-LD Person.image (real photo, stable URL) ---
try:
    av = Image.open(SRC_AVATAR).convert("RGB")
    av.save(os.path.join(PUB, "avatar.jpg"), quality=88, optimize=True)
    print("wrote avatar.jpg", av.size)
except Exception as e:
    print("avatar skip:", e)
