import assert from "node:assert";
import { describe, it } from "node:test";
import { constructTree, TreeNode } from "./directory-tree.js";

describe("constructTree", () => {
  it("空リストを渡すと空ツリーを返す", () => {
    const items: string[] = [];
    const expected: TreeNode = { name: "", path: "", children: [] };
    assert.deepStrictEqual(constructTree(items), expected);
  });

  it("ファイルのみを渡すとそれのみを返す", () => {
    const items = ["file"];
    const expected: TreeNode = {
      name: "",
      path: "",
      children: [{ name: "file", path: "/file", children: [] }],
    };
    assert.deepStrictEqual(constructTree(items), expected);
  });

  it("同じディレクトリに複数ファイルがある場合はまとめる", () => {
    const items = ["dir/file1", "dir/file2"];
    const expected: TreeNode = {
      name: "",
      path: "",
      children: [
        {
          name: "dir",
          path: "/dir",
          children: [
            { name: "file1", path: "/dir/file1", children: [] },
            { name: "file2", path: "/dir/file2", children: [] },
          ],
        },
      ],
    };
    assert.deepStrictEqual(constructTree(items), expected);
  });

  it("ディレクトリ内にファイルが一つのみでもディレクトリとファイルの階層は分ける", () => {
    const items = ["file0", "dir1/file1", "dir2/dir3/file2"];
    const expected: TreeNode = {
      name: "",
      path: "",
      children: [
        {
          name: "file0",
          path: "/file0",
          children: [],
        },
        {
          name: "dir1",
          path: "/dir1",
          children: [{ name: "file1", path: "/dir1/file1", children: [] }],
        },
        {
          name: "dir2/dir3",
          path: "/dir2/dir3",
          children: [{ name: "file2", path: "/dir2/dir3/file2", children: [] }],
        },
      ],
    };
    assert.deepStrictEqual(constructTree(items), expected);
  });

  it("ネストされたディレクトリに入ったファイルを渡すと最大限まとめる", () => {
    const items = [
      "file0",
      "dir1/dir2/dir3/file1",
      "dir1/dir2/dir3/file2",
      "dir4/dir5/file3",
      "dir4/file4",
      "dir4/dir6/dir7/file5",
      "dir4/dir6/dir7/file6",
    ];
    const expected: TreeNode = {
      name: "",
      path: "",
      children: [
        {
          name: "file0",
          path: "/file0",
          children: [],
        },
        {
          name: "dir1/dir2/dir3",
          path: "/dir1/dir2/dir3",
          children: [
            { name: "file1", path: "/dir1/dir2/dir3/file1", children: [] },
            { name: "file2", path: "/dir1/dir2/dir3/file2", children: [] },
          ],
        },
        {
          name: "dir4",
          path: "/dir4",
          children: [
            {
              name: "dir5",
              path: "/dir4/dir5",
              children: [
                {
                  name: "file3",
                  path: "/dir4/dir5/file3",
                  children: [],
                },
              ],
            },
            {
              name: "file4",
              path: "/dir4/file4",
              children: [],
            },
            {
              name: "dir6/dir7",
              path: "/dir4/dir6/dir7",
              children: [
                { name: "file5", path: "/dir4/dir6/dir7/file5", children: [] },
                { name: "file6", path: "/dir4/dir6/dir7/file6", children: [] },
              ],
            },
          ],
        },
      ],
    };
    assert.deepStrictEqual(constructTree(items), expected);
  });
});
