# Don't Starve Together In TypeScript

I have tried to add a type signature to the lua and then generate the documentation as [lua-users wiki: Documenting Lua Code](http://lua-users.org/wiki/DocumentingLuaCode) suggested. However, it is far less elegant than TypeScript.

the npm project is cloned from https://github.com/TypeStrong/typedoc/tree/master/example

[Export Documentation · LuaLS/lua-language-server Wiki](https://github.com/LuaLS/lua-language-server/wiki/Export-Documentation) --> example: [computer](https://tweaked.cc/peripheral/computer.html)

## repository struct

[git - html export different branch - Stack Overflow](https://stackoverflow.com/questions/9965884/html-export-different-branch)

```bash
git submodule add -b gh-pages git@github.com:DDLife/DST-ts.git docs/
```

nothing happens

```bash
git submodule add -f -b gh-pages git@github.com:DDLife/DST-ts.git docs/
```

typedoc will overwrite the docs folder, so create the subfolder `docs/docs` to store the generated docs.

the folder API expose the interface

## library

- generate docs: [TypeStrong/typedoc: Documentation generator for TypeScript projects.](https://github.com/TypeStrong/typedoc)
  - example: [Gerrit0/typedoc-packages-example: An example of using TypeDoc with packages mode](https://github.com/Gerrit0/typedoc-packages-example)
- generate lua: [TypeScriptToLua/TypeScriptToLua: Typescript to lua transpiler. https://typescripttolua.github.io/](https://github.com/TypeScriptToLua/TypeScriptToLua)
