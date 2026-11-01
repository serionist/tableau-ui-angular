// What the specs share; never published, since no entry point imports it.

// A computed colour's red, green and blue, from 0 to 255: `rgb()`, or `color(srgb)` from 0 to 1, as a `color-mix()` in
// srgb computes. Each must be opaque: a see-through one would need what lies under it, and an unstyled element's
// transparent background fails here rather than reading as black
function channels(colour: string): number[] {
  const values = (colour.match(/[\d.]+/g) ?? []).map(Number);
  const [red, green, blue, alpha = 1] = colour.startsWith('color(srgb ') ? [...values.slice(0, 3).map(value => value * 255), ...values.slice(3)] : values;
  if (alpha !== 1) {
    throw new Error(`Not opaque: ${colour}`);
  }
  return [red, green, blue];
}

/** WCAG's contrast ratio of two computed colours, from their relative luminance; each must be opaque */
export function contrast(text: string, background: string): number {
  const luminance = (colour: string) => {
    const [r, g, b] = channels(colour).map(value => (value / 255 <= 0.04045 ? value / 255 / 12.92 : ((value / 255 + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [lighter, darker] = [luminance(text), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

/** The background an element is drawn on: its own, or else its nearest ancestor's that isn't transparent */
export function backgroundUnder(element: Element): string {
  for (let current: Element | null = element; current !== null; current = current.parentElement) {
    const background = getComputedStyle(current).backgroundColor;
    if (background !== 'transparent' && !/^rgba\(.*,\s*0\)$/.test(background)) {
      return background;
    }
  }
  return getComputedStyle(document.documentElement).backgroundColor;
}

/**
 * Runs `check` in each colour mode, as the theme service applies it to the root element, and goes back to light after.
 * The library's styles must be in the page, from a component that loads them.
 */
export async function inEachMode(check: (mode: 'dark' | 'light') => Promise<void> | void): Promise<void> {
  try {
    for (const mode of ['light', 'dark'] as const) {
      document.documentElement.classList.toggle('dark-mode', mode === 'dark');
      await check(mode);
    }
  } finally {
    document.documentElement.classList.remove('dark-mode');
  }
}
