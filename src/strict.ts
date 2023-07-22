/**
 *
 * This module provides a strict mode for code language by using a proxy to intercept global variable assignments and access.
 *
 * It defines a GlobalMetaTable interface that keeps track of declared variables and a global function that can be used to declare variables.
 *
 * If a variable is accessed or assigned without being declared first, an error is thrown.
 *
 * @packageDocumentation
 */
import { debug, _G as _G_old } from "API/System";

interface GlobalMetaTable {
  __declared: { [key: string]: boolean };
}

const mt: GlobalMetaTable = {
  __declared: {},
};

const __STRICT: boolean = true;

/**
 * GitHub Copilot: The error message "Cannot assign to '_G' because it is an import" is caused by trying to assign a new value to the `_G` variable, which is an import. In TypeScript, you cannot assign a new value to an imported variable.
 * It means that it just import the value, not the variable itself, which is like pass-by-value a bit.
 *
 * Here is an exmaple to exmplain this:
 *
 * ```ts
 * let _G = 0;
 * console.log(_G); // 0
 * importFunc(_G); // we pass the value of `_G` to the function parameter `_G`
 * console.log(_G); // 0 <--- the value of _G is not changed
 * function importFunc(_G:number){ _G = 1;}
 * ```
 *
 * So changing an import won't change the original variable but will misguide the programmer.
 * It's better to regard such an action as a bug.
 *
 * @see [webpack - How to change variable value from another module in javascript - Stack Overflow](https://stackoverflow.com/questions/60712238/how-to-change-variable-value-from-another-module-in-javascript)
 */
export const _G = new Proxy(_G_old, {
  set(target: any, prop: string, value: any): boolean {
    if (__STRICT && !mt.__declared[prop]) {
      const w: string = debug.getinfo(2, "S").what;
      if (w !== "main" && w !== "C") {
        throw new Error(`assign to undeclared variable '${prop}'`);
      }
      mt.__declared[prop] = true;
    }
    target[prop] = value;
    return true;
  },
  get(target: any, prop: string): any {
    if (!mt.__declared[prop] && debug.getinfo(2, "S").what !== "C") {
      throw new Error(`variable '${prop}' is not declared`);
    }
    return target[prop];
  },
});

function global(...args: string[]): void {
  for (const v of args) {
    mt.__declared[v] = true;
  }
}

global("MAIN", "WORLDGEN_MAIN");
