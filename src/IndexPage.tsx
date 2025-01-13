"use client";

import Link from "next/link.js";
import { usePathname, useSearchParams } from "next/navigation.js";
import { useCallback } from "react";

export type IndexPageProps = {
  links: string[];
};

export default function IndexPage({ links }: IndexPageProps) {
  const { resource, getIframeHref } = useIframe();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        height: "100dvh",
        background: "#eee",
      }}
    >
      <ul>
        {links.map((link) => (
          <li key={link}>
            <Link.default href={getIframeHref(link)}>{link}</Link.default>{" "}
            <Link.default href={`/_dev/catalog/${link}`} target="_blank">
              x
            </Link.default>
          </li>
        ))}
      </ul>
      <iframe
        key={resource}
        src={resource ?? undefined}
        srcDoc={resource ? undefined : "Next.js Component Catalog"}
        style={{
          border: "solid 1px red",
          width: "100%",
          height: "100%",
          resize: "both",
          background: "#fff",
        }}
      />
    </div>
  );
}

function useIframe() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resource = searchParams.get("resource");

  const getIframeHref = useCallback(
    (link: string) => {
      const ps = new URLSearchParams(searchParams);
      ps.set("resource", `/_dev/catalog/${link}`);
      return `${pathname}?${ps}`;
    },
    [pathname, searchParams]
  );

  return { resource, getIframeHref } as const;
}
