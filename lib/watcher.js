import chokidar from "chokidar";
import path from "node:path";

/**
 * @param {string} target - 監視対象ディレクトリ
 */
export function startWatcher(
  target,
  { ignoreDir, addRoute, removeRoute } = {}
) {
  const watcher = chokidar.watch(target, {
    ignored: (p, stats) =>
      stats?.isFile() &&
      !(
        p.match(/\.catalog\.[jt]sx?$/i) &&
        (!ignoreDir || path.relative(ignoreDir, p).startsWith(".."))
      ),
  });
  watcher
    .on("add", (path) => addRoute?.(path))
    .on("change", (path) => addRoute?.(path))
    .on("unlink", (path) => removeRoute?.(path));
}
