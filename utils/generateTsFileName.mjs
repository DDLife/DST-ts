/**
 * ! 文件太多了, 使用插件, VSCode 会卡死
 *
 * ! VSCode will be stuck if using the plugin, because there are too many files
 */

import path from "path";
import fs from "fs/promises";

const currentDir = path.dirname(new URL(import.meta.url).pathname);
const rootPath = path.join(currentDir, "..");
const srcPath = path.join(rootPath, "temp/scripts-DST");
const dstPath = path.join(rootPath, "src/");

async function createFile(filePath) {
  if (await fs.access(filePath).catch(() => null)) return;
  const { dir: fileDir } = path.parse(filePath);
  await fs.mkdir(fileDir, { recursive: true });
  await fs.writeFile(filePath, "");
}

async function mapFiles(fn, folder) {
  for (const name of await getCurSubDirs(folder)) {
    const fullPath = path.join(folder, name);
    const msg = {
      type: "fold",
      name,
      fullPath,
    };
    fn(msg);
    await mapFiles(fn, fullPath);
  }

  for (const name of await getCurSubFiles(folder)) {
    const msg = {
      type: "file",
      name,
      fullPath: path.join(folder, name),
    };
    fn(msg);
  }

  async function getCurSubDirs(dir) {
    const items = await fs.readdir(dir, { withFileTypes: true });
    return items
      .filter((item) => item.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => item.name);
  }

  async function getCurSubFiles(dir) {
    const items = await fs.readdir(dir, { withFileTypes: true });
    return items
      .filter((item) => item.isFile())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => item.name);
  }
}

async function generate(src, dst) {
  await mapFiles(createDocs, src.path);
  async function createDocs(msg) {
    if (msg.type == "file") {
      if (!msg.name.endsWith(src.ext)) return;
      const virtualPath = path
        .relative(src.path, msg.fullPath)
        .slice(0, -src.ext.length);
      const mdPath = path.join(dst.path, virtualPath + dst.ext);
      await createFile(mdPath, src.ext);
    }
  }
}

generate({ path: srcPath, ext: ".lua" }, { path: dstPath, ext: ".ts" }).then(
  () => {
    console.log("done");
  }
);
