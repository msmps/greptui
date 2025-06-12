import { highlight, supportsLanguage } from "cli-highlight";
import { Text } from "ink";
import type React from "react";
import { useMemo } from "react";

type Props = {
  code: string;
  language: string;
};

export function HighlightedCode({ code, language }: Props): React.ReactElement {
  const highlightedCode = useMemo(() => {
    try {
      if (supportsLanguage(language)) {
        return highlight(code, { language });
      }

      return highlight(code, { language: "plaintext" });
    } catch (e) {
      return highlight(code, { language: "plaintext" }); // TODO: revisit this
    }
  }, [code, language]);

  return <Text wrap="truncate-end">{highlightedCode}</Text>;
}
