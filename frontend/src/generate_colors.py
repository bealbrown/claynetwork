import colorsys


def hsl_to_hex(h, s, l):
    """Convert an HSL color to hex notation."""
    r, g, b = colorsys.hls_to_rgb(h, l, s)  # Note: colorsys uses HLS order
    return "#{:02x}{:02x}{:02x}".format(int(r * 255), int(g * 255), int(b * 255))


def generate_earthy_colors(n):
    """Generate n visually distinct, muted, earthy colors."""
    colors = []
    for i in range(n):
        hue = i / n  # Vary hue from 0 to 1
        saturation = 0.3 + (i % 10) * 0.05  # Vary saturation between 0.3 to 0.75 to add variety
        lightness = 0.3 + (i % 10) * 0.05  # Vary lightness between 0.3 to 0.75 to add variety
        colors.append(hsl_to_hex(hue, saturation, lightness))
    return colors


# Generate 100 distinct, muted, earthy hex color codes
earthy_colors = generate_earthy_colors(112)

# Print the generated color codes
for color in earthy_colors:
    print(color)
