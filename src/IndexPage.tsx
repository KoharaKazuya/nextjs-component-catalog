"use client";

import linkModule from "next/link.js";
import { usePathname, useSearchParams } from "next/navigation.js";
import { useCallback } from "react";

const Link = linkModule.default;

export type IndexPageProps = {
  links: string[];
  env: {
    catalogPath: string;
  };
};

export default function IndexPage({ links, env }: IndexPageProps) {
  const { resource, getInternalLink, getExternalLink } = useIframe(env);

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
            <Link href={getInternalLink(link)}>{link}</Link>{" "}
            <Link href={getExternalLink(link)} target="_blank">
              x
            </Link>
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

function useIframe({ catalogPath }: IndexPageProps["env"]) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resource = searchParams.get("resource");

  const getInternalLink = useCallback(
    (link: string) => {
      const ps = new URLSearchParams(searchParams);
      ps.set("resource", `${catalogPath}/${link}`);
      return `${pathname}?${ps}`;
    },
    [pathname, searchParams, catalogPath]
  );

  const getExternalLink = useCallback(
    (link: string) => {
      return `${catalogPath}/${link}`;
    },
    [catalogPath]
  );

  return { resource, getInternalLink, getExternalLink } as const;
}
