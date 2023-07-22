/**
 * This module exports a Config class that allows to set and get configuration options.
 * The class has methods to enable, disable and check if an option is enabled.
 * It also has a toString method that returns a string representation of the current configuration.
 * The module exports an instance of the Config class with default options.
 * The default options can be overridden by platform-specific options.
 * The platform is determined by the PLATFORM constant, which is currently set to "NACL".
 *
 * @packageDocumentation
 */
import { PLATFORM } from "API/System";

class Config {
  options: { [key: string]: any };

  constructor(options?: { [key: string]: any }) {
    this.options = {};
    if (options) {
      this.setOptions(options);
    }
  }

  setOptions(options: { [key: string]: any }): void {
    for (const [k, v] of Object.entries(options)) {
      this.options[k] = v;
    }
  }

  isEnabled(option: string): boolean {
    return this.options[option];
  }

  enable(option: string): void {
    this.options[option] = true;
  }

  disable(option: string): void {
    delete this.options[option];
  }

  toString(): string {
    const str = ["PLATFORM CONFIGURATION OPTIONS"];
    for (const [k, v] of Object.entries(this.options)) {
      str.push(`${k} = ${v}`);
    }
    return str.join("\n");
  }
}

const defaults = {
  hide_vignette: false,
  force_netbookmode: false,
};

const platform_overrides = {
  NACL: {
    force_netbookmode: true,
  },
  ANDROID: {
    hide_vignette: true,
    force_netbookmode: true,
  },
  IOS: {
    hide_vignette: true,
    force_netbookmode: true,
  },
};

export const TheConfig = new Config(defaults);

if (platform_overrides[PLATFORM as keyof typeof platform_overrides]) {
  TheConfig.setOptions(
    platform_overrides[PLATFORM as keyof typeof platform_overrides]
  );
}
