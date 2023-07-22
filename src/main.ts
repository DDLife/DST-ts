import {
  PLATFORM,
  BRANCH,
  CONFIGURATION,
  IsConsole,
  TheSim,
  Package,
  MODS_ROOT,
  kleiloadlua,
} from "API/System";
import "strict";
import { AddPrintLogger } from "debugprint";
import "config";
import "vector3";

// Override the Package.path in luaconf.h because it is impossible to find
Package.path = "scripts\\?.lua;scriptlibs\\?.lua";
Package.assetpath = [];
Package.assetpath.push({ path: "" });

Math.random();

const MAIN: number = 1;
const ENCODE_SAVES: boolean = BRANCH !== "dev";
const CHEATS_ENABLED: boolean = CONFIGURATION !== "PRODUCTION";
const CAN_USE_DBUI: boolean = CHEATS_ENABLED && PLATFORM === "WIN32_STEAM";
const SOUNDDEBUG_ENABLED: boolean = false;
const SOUNDDEBUGUI_ENABLED: boolean = false;
const WORLDSTATEDEBUG_ENABLED: boolean = false;
const DEBUG_MENU_ENABLED: boolean =
  BRANCH === "dev" || (IsConsole() && CONFIGURATION !== "PRODUCTION");
const METRICS_ENABLED: boolean = true;
const TESTING_NETWORK: number = 1;
const AUTOSPAWN_MASTER_SECONDARY: boolean = false;
const DEBUGRENDER_ENABLED: boolean = true;
const SHOWLOG_ENABLED: boolean = true;
const POT_GENERATION: boolean = false;

// Networking related configuration
const DEFAULT_JOIN_IP: string = "127.0.0.1";
const DISABLE_MOD_WARNING: boolean = false;
const DEFAULT_SERVER_SAVE_FILE: string = "/server_save";

let RELOADING: boolean = false;
let ExecutingLongUpdate: boolean = false;
const servers: { [key: string]: string } = {
  release: "http://dontstarve-release.appspot.com",
  dev: "http://dontstarve-dev.appspot.com",
  //staging = "http://dontstarve-staging.appspot.com",
  //staging is now the live preview branch
  staging: "http://dontstarve-release.appspot.com",
};
const GAME_SERVER: string = servers[BRANCH];

TheSim.SetReverbPreset("default");

let VisitURL: (url: string, notrack: boolean) => void;
if (PLATFORM === "NACL") {
  VisitURL = function (url: string, notrack: boolean) {
    if (notrack) {
      TheSim.SendJSMessage("VisitURLNoTrack:" + url);
    } else {
      TheSim.SendJSMessage("VisitURL:" + url);
    }
  };
}

interface GameplayOptions {
  // Add properties as needed
}

const GameplayOptions: GameplayOptions = {};

interface RequiredFilesForReload {
  [key: string]: number;
}

const RequiredFilesForReload: RequiredFilesForReload = {};

// Install our custom loader
const manifest_paths: { [key: string]: { manifest?: string } } = {};
const loadfn = (modulename: string) => {
  let errmsg = "";
  const modulepath = modulename.replace(/[.\\]/g, "/");
  for (const path of Package.path.split(";")) {
    let pathdata = manifest_paths[path];
    if (!pathdata) {
      pathdata = {};
      const matches = path.match(
        MODS_ROOT + "([^\\\\]+)\\\\scripts\\\\%?%.lua"
      );
      if (matches) {
        pathdata.manifest = matches[1];
      }
      manifest_paths[path] = pathdata;
    }
    const filename = path.replace("?", modulepath).replace(/\\/g, "/");
    const result = kleiloadlua(
      filename,
      pathdata.manifest,
      "scripts/" + modulepath + ".lua"
    );
    if (result) {
      const filetime = TheSim.GetFileModificationTime(filename);
      RequiredFilesForReload[filename] = filetime;
      return result;
    }
    errmsg += `\n\tno file '${filename}' (checked with custom loader)`;
  }
  return errmsg;
};
Package.loaders.splice(2, 0, loadfn);

// Patch the loadfile function for NACL
if (TheSim) {
  const loadfile = (filename: string) => {
    filename = filename.replace(".lua", "").replace("scripts/", "");
    return loadfn(filename);
  };
}
// add our print loggers
AddPrintLogger((...args: any[]) => TheSim.LuaPrint(...args));
