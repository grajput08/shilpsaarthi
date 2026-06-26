import 'server-only';
import { createAdminClient } from './supabase/admin';

/** Create short-lived signed URLs for private-bucket object paths. */
export async function signPaths(bucket: string, paths: string[]): Promise<string[]> {
  if (!paths.length) return [];
  const admin = createAdminClient();
  const { data } = await admin.storage.from(bucket).createSignedUrls(paths, 3600);
  return (data ?? []).map((d) => d.signedUrl).filter(Boolean) as string[];
}
