import type { Palette } from "@vibrant/color";
import { buildAmbientGradientCss } from "./build-gradient";

const paletteCache = new Map<string, string>();

export function cacheKey(albumId: string, source: string): string {
  return `ambient-v2:${source}:${albumId}`;
}

export function getCachedGradient(key: string): string | undefined {
  return paletteCache.get(key);
}

export function setCachedGradient(key: string, css: string): void {
  paletteCache.set(key, css);
}

function pickRgb(palette: Palette): { primary: [number, number, number]; secondary: [number, number, number] } {
  const vib = palette.Vibrant ?? palette.LightVibrant ?? palette.Muted;
  const darkV = palette.DarkVibrant ?? palette.DarkMuted ?? palette.Muted;

  const primary = vib ?? darkV ?? palette.Vibrant;
  const secondary = darkV ?? vib ?? palette.Muted;

  const p = primary?.rgb ?? ([120, 90, 160] as [number, number, number]);
  const s = secondary?.rgb ?? ([40, 35, 55] as [number, number, number]);
  return {
    primary: [p[0]!, p[1]!, p[2]!],
    secondary: [s[0]!, s[1]!, s[2]!],
  };
}

export function gradientFromPalette(palette: Palette): string {
  const { primary, secondary } = pickRgb(palette);
  return buildAmbientGradientCss(
    { r: primary[0], g: primary[1], b: primary[2] },
    { r: secondary[0], g: secondary[1], b: secondary[2] },
  );
}

export async function extractGradientFromImage(
  img: HTMLImageElement,
): Promise<string | null> {
  try {
    const { Vibrant } = await import("node-vibrant/browser");
    const palette = await Vibrant.from(img).getPalette();
    return gradientFromPalette(palette);
  } catch {
    return null;
  }
}
