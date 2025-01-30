export type TreeNode = {
  name: string;
  path: string;
  children: TreeNode[];
};

/**
 * パス一覧を受け取りツリー構造にする
 */
export function constructTree(items: string[]): TreeNode {
  const tree: TreeNode = { name: "", path: "", children: [] };

  {
    const dirMap = new Map<string, TreeNode>();
    for (const item of items) {
      let current = tree;
      let path = "";

      const fullPath = (item.startsWith("/") ? "" : "/") + item;
      for (const name of fullPath.split("/").slice(1)) {
        path += "/" + name;

        const dir = dirMap.get(path);
        if (dir) {
          current = dir;
        } else {
          const child: TreeNode = { name, path, children: [] };
          dirMap.set(path, child);
          current.children.push(child);
          current = child;
        }
      }
    }
  }

  return { ...tree, children: tree.children.map((child) => compact(child)) };
}

function compact(tree: TreeNode): TreeNode {
  const onlyOneChild = tree.children.length === 1;

  if (!onlyOneChild)
    return { ...tree, children: tree.children.map((child) => compact(child)) };

  const child = tree.children[0];
  const merged: TreeNode = {
    name: tree.name + "/" + child.name,
    path: child.path,
    children: child.children,
  };
  return compact(merged);
}
