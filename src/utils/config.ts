import { homedir } from "os";
import { join } from "path";

export const CONFIG_DIR = join(homedir(), ".greptui");

export const LAYOUT_CONSTANTS = {
  HEADER_HEIGHT: 2,
  SEARCH_BOX_HEIGHT: 3,
  INFO_BAR_HEIGHT: 1,
  PANEL_BORDER_SIZE: 2,
} as const;

export const API_CONFIG = {
  BASE_URL: process.env.GREP_API_URL || "https://grep.app/api",
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  USER_AGENT:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
} as const;

export const SEARCH_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_RESULTS_PER_PAGE: 50,
  ENABLE_SYNTAX_HIGHLIGHTING: true,
} as const;

export const GTUI_MARKER = "__GTUI_MARK__";
