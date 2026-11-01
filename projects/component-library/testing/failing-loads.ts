// What the specs share; never published, since no entry point imports it.
import { vi } from 'vitest';

/**
 * Runs `run`, in which a load fails on purpose. The library's console errors are recorded, not printed; the failure it
 * rethrows for the app's `ErrorHandler` is taken, as an app's handler would take it, where Vitest would count it as an
 * error of the run; and after `run` it waits for that rejection, which comes once the microtasks have run.
 */
export async function whileLoadsFail(run: () => Promise<void>): Promise<void> {
  const logged = vi.spyOn(console, 'error').mockImplementation(() => {
    // recorded only
  });
  const take = (event: PromiseRejectionEvent) => {
    event.preventDefault();
  };
  window.addEventListener('unhandledrejection', take);
  try {
    await run();
    await new Promise(resolve => setTimeout(resolve, 100));
  } finally {
    window.removeEventListener('unhandledrejection', take);
    logged.mockRestore();
  }
}
