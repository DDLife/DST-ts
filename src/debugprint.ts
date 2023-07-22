import { IsNotConsole, debug, CWD } from "API/System";

let PRINT_SOURCE = false;

const print_loggers: ((...args: any[]) => void)[] = [];

export function AddPrintLogger(fn: (...args: any[]) => void): void {
  print_loggers.push(fn);
}

let dir = CWD || "";
dir = dir.replace(/\\/g, "/") + "/";

const oldprint = console.log;

const matches: { [key: string]: string } = {
  "^": "%^",
  $: "%$",
  "(": "%(",
  ")": "%)",
  "%": "%%",
  ".": "%.",
  "[": "%[",
  "]": "%]",
  "*": "%*",
  "+": "%+",
  "-": "%-",
  "?": "%?",
  "\0": "%z",
};

function escape_lua_pattern(s: string): string {
  return s.replace(/./g, (c: string) => matches[c] || c);
}

function packstring(...args: any[]): string {
  let str = "";
  const n = args.length;
  for (let i = 0; i < n; i++) {
    str += String(args[i]) + "\t";
  }
  return str;
}

console.log = function (...args: any[]): void {
  let str = "";
  if (PRINT_SOURCE) {
    const info = debug.getinfo(2, "Sl");
    const source = info && info.source;
    if (source) {
      str = `${source}(${info.currentline},1) ${packstring(...args)}`;
    } else {
      str = packstring(...args);
    }
  } else {
    str = packstring(...args);
  }
  for (const logger of print_loggers) {
    logger(str);
  }
};

function nolineprint(...args: any[]): void {
  for (const logger of print_loggers) {
    logger(...args);
  }
}

const debugstr: string[] = [];
const MAX_CONSOLE_LINES = 20;

function consolelog(...args: any[]): void {
  let str = packstring(...args);
  str = str.replace(new RegExp(escape_lua_pattern(dir), "g"), "");
  for (const line of str.split("\r\n")) {
    debugstr.push(line);
  }
  while (debugstr.length > MAX_CONSOLE_LINES) {
    debugstr.shift();
  }
}

export function GetConsoleOutputList(): string[] {
  return debugstr;
}

if (IsNotConsole()) {
  AddPrintLogger(consolelog);
}
