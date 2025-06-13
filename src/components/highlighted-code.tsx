import chalk from "chalk";
import { highlight, supportsLanguage } from "cli-highlight";
import { Text } from "ink";
import type React from "react";
import { useMemo } from "react";
import stripAnsi from "strip-ansi";
import { GTUI_MARKER } from "../utils/config";

type Props = {
  code: string;
  language: string;
};

const replaceMarkers = (code: string) => {
  const parts = code.split(GTUI_MARKER);

  return parts
    .map((part, i) =>
      i % 2 === 1 ? chalk.black.bold.bgHex("#cde7ff")(part) : part,
    )
    .join("");
};

export function HighlightedCode({ code, language }: Props): React.ReactElement {
  const highlightedCode = useMemo(() => {
    const codeWithMarkers = stripAnsi(code);

    try {
      if (supportsLanguage(language)) {
        return replaceMarkers(
          highlight(codeWithMarkers, {
            language,
          }),
        );
      }

      return replaceMarkers(
        highlight(codeWithMarkers, {
          language: "plaintext",
        }),
      );
    } catch {
      return replaceMarkers(
        highlight(codeWithMarkers, {
          language: "plaintext",
          ignoreIllegals: true,
        }),
      );
    }
  }, [code, language]);

  return <Text wrap="truncate-end">{highlightedCode}</Text>;
}
