import path from "path";
import fs from "fs/promises";

const excludedFiles = ["API"];
const currentDir = path.dirname(new URL(import.meta.url).pathname);
const rootPath = path.join(currentDir, "..");
const srcPath = path.join(rootPath, "src");

async function main() {
  const tree = await createFolderTree(srcPath);
  const html = await getHtml(tree);
  await fs.writeFile(path.join(rootPath, "docs/progress/index.html"), html);
}

class File {
  constructor(name, fullPath) {
    this.name = name;
    this.fullPath = fullPath;
    this.isChecked = false;
    this.checkRes = false;
  }

  /**
   * I will add the `@packageDocumentation` to the top of the file if it has been processed.
   */
  async isDone() {
    if (this.isChecked) return this.checkRes;
    this.checkRes = await fs
      .readFile(this.fullPath, "utf8")
      .then((content) => content.includes("@packageDocumentation"));
    let content = await fs.readFile(this.fullPath, "utf8");
    this.isChecked = true;
    return this.checkRes;
  }

  async toHtml() {
    const { name, fullPath } = this;
    return `<li class="file ${
      (await this.isDone()) ? "done" : "fail"
    }">${name}</li>`;
  }
}

class Folder {
  constructor(name, fullPath) {
    this.name = name;
    this.fullPath = fullPath;
    this.files = [];
    this.folders = [];
    this.isChecked = false;
    this.checkRes = 0;
    this.isCalc = false;
    this.total = 0;
  }

  addFile(file) {
    this.files.push(file);
  }

  addFolder(folder) {
    this.folders.push(folder);
  }

  async getProgress() {
    if (this.isChecked) return this.checkRes;
    this.checkRes =
      (await Promise.all(this.files.map((file) => file.isDone())).then(
        (res) => res.filter((item) => item).length
      )) +
      (await Promise.all(
        // count the files that have been processed
        this.folders.map((folder) => folder.getProgress())
      ).then((res) => res.reduce((acc, cur) => acc + cur, 0))); // count the files that have been processed
    this.isChecked = true;
    return this.checkRes;
  }

  getFileCount() {
    if (this.isCalc) return this.total;
    this.total =
      this.files.length +
      this.folders.reduce((acc, cur) => acc + cur.getFileCount(), 0);
    this.isCalc = true;
    return this.total;
  }

  async toHtml() {
    const { name, fullPath } = this;
    const sortedFiles = this.files.sort((a, b) => a.name.localeCompare(b.name)); // sort files alphabetically
    const filesHtml = (
      await Promise.all(sortedFiles.map((file) => file.toHtml()))
    ).join("");
    const sortedFolders = this.folders.sort((a, b) =>
      a.name.localeCompare(b.name)
    ); // sort folders alphabetically
    const foldersHtml = (
      await Promise.all(sortedFolders.map((folder) => folder.toHtml()))
    ).join("");
    // const prettyName = `${name}
    // <div
    //   data-preset="bubble"
    //   class="ldBar label-center"
    //   data-value="${parseInt(
    //     ((await this.getProgress()) / this.getFileCount()) * 100
    //   )}"
    //   style="width:20px;height:20px"
    // ></div>`;
    const prettyName = `${name} ${await this.getProgress()}/${this.getFileCount()}`;
    return `<li class="folder ${
      this.getProgress() == this.getFileCount ? "done" : "pending"
    }">${prettyName}<ul>${foldersHtml}${filesHtml}</ul></li>`;
  }
}

async function createFolderTree(rootPath) {
  const rootName = path.basename(rootPath);
  const rootFolder = new Folder(rootName, rootPath);

  async function traverseFolder(folder) {
    const entries = await fs.readdir(folder.fullPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(folder.fullPath, entry.name);

      if (entry.isDirectory()) {
        if (!isExcludedFile(entry.name)) {
          const subFolder = new Folder(entry.name, entryPath);
          folder.addFolder(subFolder);
          await traverseFolder(subFolder);
        }
      } else {
        const file = new File(entry.name, entryPath);
        folder.addFile(file);
      }
    }
  }

  await traverseFolder(rootFolder);
  return rootFolder;

  function isExcludedFile(name) {
    return excludedFiles.includes(name);
  }
}

async function getHtml(tree) {
  return `<!DOCTYPE html>
    <html>
      <head>
        <title>Collapsible List</title>
        <meta charset="utf-8" />
    
        <!-- (A) LOAD CSS & JS -->
        <link rel="stylesheet" href="./dist/collapse-list.css" />
        <script src="./dist/collapse-list.js"></script>
        <link rel="stylesheet" type="text/css" href="./dist/loading-bar.css"/>
        <script type="text/javascript" src="./dist/loading-bar.js"></script>
      </head>
      <body>
        <!-- (B) NESTED LIST -->
        <ul class="collapse">
          ${await tree.toHtml()}
        </ul>
      </body>
    </html>`;
}

main();
