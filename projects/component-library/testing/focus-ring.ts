// What the specs share; never published, since no entry point imports it.
import { page } from 'vitest/browser';

export interface RingEdges {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * How much of each edge of a focused element shows the theme's focus ring, as the browser paints it: from a screenshot
 * of the element, the share of the points along each edge whose band, `width` px deep, holds `--twc-color-focused-input`.
 * The library's styles must be in the page, from a component that loads them.
 */
export async function focusRingShown(element: Element, width = 2): Promise<RingEdges> {
  const [red, green, blue] = focusColour();
  const base64 = await page.screenshot({ element, save: false });
  const image = new Image();
  image.src = `data:image/png;base64,${base64}`;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d')!;
  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(0, 0, image.width, image.height);
  // the screenshot's pixels per CSS pixel
  const depth = Math.max(1, Math.round((width * image.width) / element.getBoundingClientRect().width));
  const ring = (x: number, y: number) => {
    const i = (y * image.width + x) * 4;
    return Math.abs(data[i] - red) <= 24 && Math.abs(data[i + 1] - green) <= 24 && Math.abs(data[i + 2] - blue) <= 24;
  };
  // the share of the points along an edge with the ring somewhere in their band
  const shown = (length: number, at: (along: number, into: number) => [number, number]) => {
    let points = 0;
    for (let along = 0; along < length; along++) {
      for (let into = 0; into < depth; into++) {
        if (ring(...at(along, into))) {
          points++;
          break;
        }
      }
    }
    return points / length;
  };
  const right = image.width - 1;
  const bottom = image.height - 1;
  return {
    top: shown(image.width, (x, y) => [x, y]),
    right: shown(image.height, (y, x) => [right - x, y]),
    bottom: shown(image.width, (x, y) => [x, bottom - y]),
    left: shown(image.height, (y, x) => [x, y]),
  };
}

// The theme's focus colour, as computed
function focusColour(): number[] {
  const probe = document.createElement('div');
  probe.style.color = 'var(--twc-color-focused-input)';
  document.body.appendChild(probe);
  const colour = getComputedStyle(probe).color;
  probe.remove();
  return (colour.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
}
