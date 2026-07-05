/**
 * Determines whether a nav link should be visually marked active.
 * Matches the home route exactly; matches all other routes as prefixes
 * so detail pages (e.g. /shop/some-product) keep their parent link lit.
 */
export function isNavLinkActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}