import pkg from "../package.json" with { type: "json" };

export const VERSION: string =
  process.env.GREPTUI_VERSION ?? (pkg as { version: string }).version;
