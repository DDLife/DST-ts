#!/usr/bin/env zx

//see [google/zx: A tool for writing better scripts](https://github.com/google/zx)

async function deployDocs() {
  await $`node utils/updateProgress.mjs`;
  await $`npm run build`; // typedoc
  await $`utils/gh-pages.sh -b gh-pages -- docs/`; // export the folder `docs/` to the branch `gh-pages`
}
