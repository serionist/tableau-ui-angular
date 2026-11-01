/**
 * A failure that was already reported, as a full load's is by its `AllDataInfo`: a block cut from that load fails with
 * it, and takes the error status without reporting the failure again. Its `cause` is the load's own error. Internal:
 * the entry point doesn't export it.
 */
export class ReportedError extends Error {
  constructor(cause: unknown) {
    super('Already reported', { cause });
    this.name = 'ReportedError';
  }
}
