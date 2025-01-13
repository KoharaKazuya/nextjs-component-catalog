// @see https://github.com/vercel/next.js/blob/09e47152bf71839bc69e7d86b0073aa118eca1e8/packages/next/src/shared/lib/router/utils/app-paths.ts#L4-L52
/**
 * Normalizes an app route so it represents the actual request path. Essentially
 * performing the following transformations:
 *
 * - `/(dashboard)/user/[id]/page` to `/user/[id]`
 * - `/(dashboard)/account/page` to `/account`
 * - `/user/[id]/page` to `/user/[id]`
 * - `/account/page` to `/account`
 * - `/page` to `/`
 * - `/(dashboard)/user/[id]/route` to `/user/[id]`
 * - `/(dashboard)/account/route` to `/account`
 * - `/user/[id]/route` to `/user/[id]`
 * - `/account/route` to `/account`
 * - `/route` to `/`
 * - `/` to `/`
 *
 * @param route the app route to normalize
 * @returns the normalized pathname
 */
export function normalizeAppPath(route: string) {
  return ensureLeadingSlash(
    route.split("/").reduce((pathname, segment, index, segments) => {
      // Empty segments are ignored.
      if (!segment) {
        return pathname;
      }

      // Groups are ignored.
      if (isGroupSegment(segment)) {
        return pathname;
      }

      // Parallel segments are ignored.
      if (segment[0] === "@") {
        return pathname;
      }

      // The last segment (if it's a leaf) should be ignored.
      if (
        (segment === "page" || segment === "route") &&
        index === segments.length - 1
      ) {
        return pathname;
      }

      return `${pathname}/${segment}`;
    }, "")
  );
}

// @see https://github.com/vercel/next.js/blob/09e47152bf71839bc69e7d86b0073aa118eca1e8/packages/next/src/shared/lib/page-path/ensure-leading-slash.ts#L1-L7
/**
 * For a given page path, this function ensures that there is a leading slash.
 * If there is not a leading slash, one is added, otherwise it is noop.
 */
export function ensureLeadingSlash(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

// @see https://github.com/vercel/next.js/blob/09e47152bf71839bc69e7d86b0073aa118eca1e8/packages/next/src/shared/lib/segment.ts#L3-L6
export function isGroupSegment(segment: string) {
  // Use array[0] for performant purpose
  return segment[0] === "(" && segment.endsWith(")");
}
