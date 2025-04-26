import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import type { TreeNode } from "./directory-tree";
import { constructTree } from "./directory-tree";
import LinkItem from "./LinkItem";
import Preview from "./Preview";

export type IndexPageProps = {
  links: string[];
  env: {
    catalogPath: string;
  };
};

export default function IndexPageInner({ links, env }: IndexPageProps) {
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
        <Link href="/" style={{ display: "block", margin: "8px 20px" }}>
          Home
        </Link>
        <LinkTree
          tree={tree}
          itemRenderer={({ path, name }) => (
            <Suspense>
              <LinkItem {...{ env, path, name }} />
            </Suspense>
          )}
        />
      </div>
      <Suspense>
        <Preview />
      </Suspense>
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
  const hasLeaf = tree.children.some((child) => child.children.length === 0);
  return (
    <div>
      <div style={{ color: "#666", fontSize: 14, margin: "16px auto 0" }}>
        {tree.name}
      </div>
      {hasLeaf && (
        <div style={{ color: "#999", fontSize: 11, margin: "0 auto 8px" }}>
          {tree.path}
        </div>
      )}
      <ul style={{ padding: "8px 8px 8px 20px" }}>
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
