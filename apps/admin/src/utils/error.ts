import { AppError } from '@oceanfresh/shared';

/**
 * Normalizes any thrown value into a human-readable message, with
 * actionable hints for the known production prerequisites:
 *  - PGRST202 / "Could not find the function"  -> apply database/016_production_fixes.sql
 *  - 404 on the storage bucket / region instance — create the `products` bucket.
 */
export function errorToMessage(err: unknown): string {
  if (err instanceof AppError) return err.message;

  if (err && typeof err === 'object') {
    const candidate = err as {
      message?: unknown;
      code?: unknown;
      hint?: unknown;
      details?: unknown;
    };

    if (candidate.code === 'PGRST202' || candidate.code === 'PGRST301') {
      return (
        'The database helper for this action is missing. Run the production migration ' +
        '`database/016_production_fixes.sql` against the Supabase SQL editor, then retry.'
      );
    }

    if (candidate.code === '40401' && candidate.message) {
      return (
        'The media bucket could not be found. Create the `products` storage bucket in the ' +
        'Supabase dashboard (per `database/016_production_fixes.sql`), then retry.'
      );
    }

    if (typeof candidate.message === 'string') {
      return candidate.message;
    }
  }

  return 'Something went wrong. Please try again.';
}

export function getErrorCode(err: unknown): string | null {
  if (err && typeof err === 'object') {
    const code = (err as { code?: unknown }).code;
    if (typeof code === 'string') return code;
  }
  return null;
}
