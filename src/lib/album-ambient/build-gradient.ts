/** Relative luminance ~ sRGB, 0–1 */
export function relativeLuminance(r: number, g: number, b: number): number {
  const lin = [r, g, b].map((c) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0]! + 0.7152 * lin[1]! + 0.0722 * lin[2]!;
}

function mix(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  t: number,
) {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

/**
 * Keep very dark covers from going fully black (visible ambient tint) and
 * very bright covers from washing the UI.
 */
export function clampAmbientRgb(
  r: number,
  g: number,
  b: number,
  opts: { minLum?: number; maxLum?: number } = {},
): { r: number; g: number; b: number } {
  const minLum = opts.minLum ?? 0.09;
  const maxLum = opts.maxLum ?? 0.84;
  let lum = relativeLuminance(r, g, b);
  let out = { r, g, b };
  if (lum < minLum) {
    const t = Math.min(1, (minLum - lum) / minLum) * 0.38;
    out = mix(out, { r: 90, g: 60, b: 120 }, t);
  } else if (lum > maxLum) {
    const t = Math.min(1, (lum - maxLum) / (1 - maxLum)) * 0.32;
    out = mix(out, { r: 28, g: 26, b: 34 }, t);
  }
  return out;
}

export type AmbientGradientCss = string;

/** Ambient wash: stronger album-derived radials + softer neutral veils so color reads clearly */
export function buildAmbientGradientCss(
  primary: { r: number; g: number; b: number },
  secondary: { r: number; g: number; b: number },
): AmbientGradientCss {
  const p = clampAmbientRgb(primary.r, primary.g, primary.b);
  const s = clampAmbientRgb(secondary.r, secondary.g, secondary.b);
  const core = `rgba(${p.r},${p.g},${p.b},0.46)`;
  const corner = `rgba(${s.r},${s.g},${s.b},0.34)`;
  const deep = "rgba(5, 5, 9, 0.88)";
  return [
    `radial-gradient(ellipse 95% 78% at 12% 30%, ${core}, transparent 62%)`,
    `radial-gradient(ellipse 82% 68% at 96% 6%, ${corner}, transparent 58%)`,
    `radial-gradient(ellipse 140% 90% at 72% 105%, ${deep}, transparent 48%)`,
    `linear-gradient(165deg, rgba(4,4,8,0.42) 0%, transparent 42%, rgba(3,3,6,0.78) 100%)`,
  ].join(", ");
}
