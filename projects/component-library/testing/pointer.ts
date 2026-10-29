// What the specs share; never published, since no entry point imports it.
import { userEvent } from 'vitest/browser';

/**
 * Moves the real pointer to the page's bottom right corner. A test that clicked with `userEvent` leaves it where it
 * clicked, and a dropdown or menu that opens under it takes a hover from it (Firefox sends one on layout changes),
 * which moves the highlight the test drives with the keyboard.
 */
export async function movePointerAway(): Promise<void> {
  const corner = document.createElement('div');
  corner.style.cssText = 'position: fixed; right: 0; bottom: 0; width: 4px; height: 4px';
  document.body.appendChild(corner);
  try {
    await userEvent.hover(corner);
  } finally {
    corner.remove();
  }
}
