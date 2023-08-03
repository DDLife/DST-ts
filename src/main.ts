import {
  PLATFORM,
  BRANCH,
  CONFIGURATION,
  IsConsole,
  TheSim,
  Package,
  MODS_ROOT,
  kleiloadlua,
  TheMixer,
} from "API/System";

// Override the Package.path in luaconf.h because it is impossible to find
Package.path = "scripts\\?.lua;scriptlibs\\?.lua";
Package.assetpath = [];
Package.assetpath.push({ path: "" });

Math.random();

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

import "strict";
import { AddPrintLogger } from "debugprint";
// add our print loggers
AddPrintLogger((...args: any[]) => TheSim.LuaPrint(...args));

import "config";
import "vector3";
import "mainfunctions";
import "preloadsounds";

import "mods";
import "json";
import "tuning";

import ProfileClass from "playerprofile";
let Profile = ProfileClass(); // profile needs to be loaded before language
Profile.Load(null, true); // true to indicate minimal load required for language.lua to read the profile.
import LOC from "languages/loc";
import "languages/language";
import "strings";

//Apply a baseline set of translations so that lua in the boot flow can access the correct strings, after the mods are loaded, main.lua will run this again
//Ideally we wouldn't need to do this, but stuff like maps/levels/forest loads in the boot flow and it caches strings before they've been translated.
//Doing an early translate here is less risky than changing all the cases of early string access. Downside is that it doesn't address the issue for mod transations.

TranslateStringTable(STRINGS);

import "./stringutil";
import "./dlcsupport_strings";
import "./constants";
import "./class";
import "./util";
import "./vecutil";
import "./vec3util";
import "./datagrid";
import "./ocean_util";
import "./actions";
import "./debugtools";
import "./simutil";
import "./scheduler";
import "./stategraph";
import "./behaviourtree";
import "./prefabs";
import "./tiledefs";
import "./tilegroups";
import "./falloffdefs";
import "./groundcreepdefs";
import "./prefabskin";
import "./entityscript";
import "./profiler";
import "./recipes";
import "./brain";
import "./emitters";
import "./dumper";
import "./input";
import "./upsell";
import "./stats";
import "./frontend";
import "./netvars";
import "./networking";
import "./networkclientrpc";
import "./shardnetworking";
import "./fileutil";
import "./prefablist";
import "./standardcomponents";
import "./update";
import "./fonts";
import "./physics";
import "./modindex";
import "./mathutil";
import "./components/lootdropper";
import "./reload";
import "./saveindex"; // Added by Altgames for Android focus lost handling
import "./shardsaveindex";
import "./shardindex";
import "./custompresets";
import "./gamemodes";
import "./skinsutils";
import "./wxputils";
import "./klump";
import "./popupmanager";
import "./chathistory";
import "./componentutil";
import "./skins_defs_data";

if (TheConfig.IsEnabled("force_netbookmode")) {
  TheSim.SetNetbookMode(true);
}

console.log("Running main.lua\n");

TheSystemService.SetStalling(true);

let VERBOSITY_LEVEL = VERBOSITY.ERROR;
if (CONFIGURATION != "PRODUCTION") {
  VERBOSITY_LEVEL = VERBOSITY.DEBUG;
}

// uncomment this line to override
VERBOSITY_LEVEL = VERBOSITY.WARNING;

// instantiate the mixer
import Mixer from "mixer";
TheMixer = Mixer.Mixer();
import "mixes";
TheMixer.PushMix("start");

import Stats from "stats";
