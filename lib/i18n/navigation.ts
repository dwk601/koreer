import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Lightweight wrappers around Next.js navigation APIs that are aware of the
 * locale prefix. Always import `Link`, `useRouter`, `usePathname`, and
 * `redirect` from here rather than from `next/link` or `next/navigation`.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
