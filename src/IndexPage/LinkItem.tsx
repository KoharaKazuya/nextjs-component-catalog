"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { IndexPageProps } from "./IndexPage";

export default function LinkItem({
  env,
  path,
  name,
}: Pick<IndexPageProps, "env"> & { path: string; name: string }) {
  const { getInternalLink, getExternalLink } = useIframeLink({
    catalogPath: env.catalogPath,
  });
  return (
    <>
      <Link href={getInternalLink(path)} scroll={false}>
        {name}
      </Link>{" "}
      <Link href={getExternalLink(path)} target="_blank">
        <small>↗</small>
      </Link>
    </>
  );
}

function useIframeLink({ catalogPath }: IndexPageProps["env"]) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getInternalLink = useCallback(
    (link: string) => {
      const ps = new URLSearchParams(searchParams);
      ps.set("resource", `${catalogPath}${link}`);
      return `${pathname}?${ps}`;
    },
    [pathname, searchParams, catalogPath]
  );

  const getExternalLink = useCallback(
    (link: string) => {
      return `${catalogPath}${link}`;
    },
    [catalogPath]
  );

  return { getInternalLink, getExternalLink } as const;
}
