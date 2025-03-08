"use client";

import linkModule from "next/link.js";
import { usePathname, useSearchParams } from "next/navigation.js";
import type { ReactNode } from "react";
import { useCallback } from "react";
import type { TreeNode } from "./directory-tree.js";
import { constructTree } from "./directory-tree.js";

const Link = linkModule.default;

export type IndexPageProps = {
  links: string[];
  env: {
    catalogPath: string;
  };
};

export default function IndexPage({ links, env }: IndexPageProps) {
  const { resource, getInternalLink, getExternalLink } = useIframe(env);
  const tree = constructTree(links);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 3fr",
        height: "100dvh",
        background: "#eee",
      }}
    >
      <div style={{ overflow: "auto" }}>
        <LinkTree
          tree={tree}
          itemRenderer={({ path, name }) => (
            <>
              <Link href={getInternalLink(path)}>{name}</Link>{" "}
              <Link href={getExternalLink(path)} target="_blank">
                <small>↗</small>
              </Link>
            </>
          )}
        />
      </div>
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

function LinkTree({
  tree,
  itemRenderer,
}: {
  tree: TreeNode;
  itemRenderer: (leaf: TreeNode) => ReactNode;
}) {
  return (
    <div>
      <div style={{ color: "#666", fontSize: 14, margin: "16px auto 8px" }}>
        {tree.name}
      </div>
      <ul style={{ padding: 8 }}>
        {tree.children.map((child) => (
          <li key={child.path}>
            {child.children.length > 0 ? (
              <LinkTree tree={child} itemRenderer={itemRenderer} />
            ) : (
              itemRenderer(child)
            )}
          </li>
        ))}
      </ul>
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

  return { resource, getInternalLink, getExternalLink } as const;
}
