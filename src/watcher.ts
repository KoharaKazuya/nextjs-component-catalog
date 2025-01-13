import chokidar from "chokidar";
import path from "node:path";

export function startWatcher(
  target: string,
  {
    ignoreDir,
    addRoute,
    removeRoute,
  }: {
    ignoreDir?: string;
    addRoute?: (path: string) => void;
    removeRoute?: (path: string) => void;
  } = {}
) {
  const watcher = chokidar.watch(target, {
    ignored: (p, stats) =>
      Boolean(
        stats?.isFile() &&
          !(
            p.match(/\.catalog\.[jt]sx?$/i) &&
            (!ignoreDir || path.relative(ignoreDir, p).startsWith(".."))
          )
      ),
  });
  watcher
    .on("add", (path) => addRoute?.(path))
    .on("change", (path) => addRoute?.(path))
    .on("unlink", (path) => removeRoute?.(path));
  return watcher;
}
