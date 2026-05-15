/**
 * Pandoos Music — Album Art Color Extraction Engine
 * 
 * Extracts dominant colors from album art to create dynamic ambient themes.
 * Uses canvas pixel sampling for lightweight, fast extraction.
 * No external dependencies.
 */

const colorCache = new Map();

/**
 * Extract dominant colors from an image URL
 * Returns { primary, secondary, accent, isDark, gradient, textColor }
 */
export async function extractColors(imageUrl) {
  if (!imageUrl) return getDefaultColors();
  if (colorCache.has(imageUrl)) return colorCache.get(imageUrl);

  try {
    const colors = await extractFromImage(imageUrl);
    colorCache.set(imageUrl, colors);
    return colors;
  } catch {
    return getDefaultColors();
  }
}

function extractFromImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        // Sample at low resolution for speed
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imageData = ctx.getImageData(0, 0, size, size).data;
        const colors = quantizeColors(imageData, size);
        resolve(colors);
      } catch {
        resolve(getDefaultColors());
      }
    };
    img.onerror = () => resolve(getDefaultColors());
    // Use a proxy-friendly URL or direct
    img.src = url;
    // Timeout after 3s
    setTimeout(() => resolve(getDefaultColors()), 3000);
  });
}

function quantizeColors(data, size) {
  const buckets = {};
  const totalPixels = size * size;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 128) continue; // Skip transparent

    // Quantize to reduce colors (bucket by 32)
    const qr = Math.round(r / 32) * 32;
    const qg = Math.round(g / 32) * 32;
    const qb = Math.round(b / 32) * 32;
    const key = `${qr},${qg},${qb}`;

    if (!buckets[key]) buckets[key] = { r: 0, g: 0, b: 0, count: 0 };
    buckets[key].r += r;
    buckets[key].g += g;
    buckets[key].b += b;
    buckets[key].count++;
  }

  // Sort by frequency
  const sorted = Object.values(buckets)
    .sort((a, b) => b.count - a.count)
    .map(b => ({
      r: Math.round(b.r / b.count),
      g: Math.round(b.g / b.count),
      b: Math.round(b.b / b.count),
    }));

  // Filter out very dark and very light colors for vibrant picks
  const vibrant = sorted.filter(c => {
    const lum = (c.r * 0.299 + c.g * 0.587 + c.b * 0.114);
    return lum > 30 && lum < 220;
  });

  const primary = vibrant[0] || sorted[0] || { r: 34, g: 197, b: 94 };
  const secondary = vibrant[1] || sorted[1] || vibrant[0] || { r: 168, g: 85, b: 247 };
  const accent = vibrant[2] || sorted[2] || { r: 59, g: 130, b: 246 };

  const avgLum = (primary.r * 0.299 + primary.g * 0.587 + primary.b * 0.114);
  const isDark = avgLum < 128;

  // Boost saturation for more vivid ambient effect
  const boosted = boostSaturation(primary, 1.3);
  const boosted2 = boostSaturation(secondary, 1.2);

  return {
    primary: `rgb(${boosted.r},${boosted.g},${boosted.b})`,
    secondary: `rgb(${boosted2.r},${boosted2.g},${boosted2.b})`,
    accent: `rgb(${accent.r},${accent.g},${accent.b})`,
    isDark,
    primaryRaw: boosted,
    secondaryRaw: boosted2,
    gradient: `linear-gradient(135deg, 
      rgba(${boosted.r},${boosted.g},${boosted.b},0.4) 0%, 
      rgba(6,6,8,0.95) 50%, 
      rgba(${boosted2.r},${boosted2.g},${boosted2.b},0.3) 100%)`,
    gradientSubtle: `linear-gradient(135deg, 
      rgba(${boosted.r},${boosted.g},${boosted.b},0.15) 0%, 
      rgba(6,6,8,1) 60%, 
      rgba(${boosted2.r},${boosted2.g},${boosted2.b},0.1) 100%)`,
    glow: `rgba(${boosted.r},${boosted.g},${boosted.b},0.35)`,
    glowSubtle: `rgba(${boosted.r},${boosted.g},${boosted.b},0.12)`,
    textColor: isDark ? '#f4f4f8' : '#060608',
  };
}

function boostSaturation(color, factor) {
  const max = Math.max(color.r, color.g, color.b);
  const min = Math.min(color.r, color.g, color.b);
  if (max === min) return color; // Grayscale

  const mid = (max + min) / 2;
  return {
    r: Math.min(255, Math.round(mid + (color.r - mid) * factor)),
    g: Math.min(255, Math.round(mid + (color.g - mid) * factor)),
    b: Math.min(255, Math.round(mid + (color.b - mid) * factor)),
  };
}

function getDefaultColors() {
  return {
    primary: 'rgb(34,197,94)',
    secondary: 'rgb(168,85,247)',
    accent: 'rgb(59,130,246)',
    isDark: true,
    primaryRaw: { r: 34, g: 197, b: 94 },
    secondaryRaw: { r: 168, g: 85, b: 247 },
    gradient: 'linear-gradient(135deg, rgba(34,197,94,0.4) 0%, rgba(6,6,8,0.95) 50%, rgba(168,85,247,0.3) 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(6,6,8,1) 60%, rgba(168,85,247,0.1) 100%)',
    glow: 'rgba(34,197,94,0.35)',
    glowSubtle: 'rgba(34,197,94,0.12)',
    textColor: '#f4f4f8',
  };
}

/**
 * Apply ambient colors to CSS custom properties on an element
 */
export function applyAmbientColors(element, colors) {
  if (!element || !colors) return;
  element.style.setProperty('--ambient-primary', colors.primary);
  element.style.setProperty('--ambient-secondary', colors.secondary);
  element.style.setProperty('--ambient-accent', colors.accent);
  element.style.setProperty('--ambient-gradient', colors.gradient);
  element.style.setProperty('--ambient-gradient-subtle', colors.gradientSubtle);
  element.style.setProperty('--ambient-glow', colors.glow);
  element.style.setProperty('--ambient-glow-subtle', colors.glowSubtle);
}

/**
 * Pre-warm the cache for a list of image URLs
 */
export function prewarmColors(urls) {
  urls.forEach(url => {
    if (url && !colorCache.has(url)) {
      extractColors(url).catch(() => {});
    }
  });
}
