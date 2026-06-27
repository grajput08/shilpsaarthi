/** Portal-scoped auth areas — each gets its own Supabase session cookie. */
export type AuthArea = 'admin' | 'verifier';

export const AREA_COOKIE_NAME: Record<AuthArea, string> = {
  admin: 'sb-admin-auth-token',
  verifier: 'sb-verifier-auth-token',
};

const ADMIN_PREFIXES = ['/login', '/admin', '/dashboard', '/crm', '/register'];

/** Resolve which portal session to refresh from the request path, or null for public routes. */
export function resolveAuthArea(pathname: string): AuthArea | null {
  if (pathname === '/') return 'admin';
  if (pathname.startsWith('/verifier')) return 'verifier';
  if (ADMIN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return 'admin';
  return null;
}

/** Infer portal from allowed roles in requireProfile. */
export function areaFromRoles(roles: string[]): AuthArea {
  return roles.length === 1 && roles[0] === 'verifier' ? 'verifier' : 'admin';
}
