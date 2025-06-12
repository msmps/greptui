import { Box, Text } from "ink";
import { useMemo } from "react";
import { usePanelHeight } from "../hooks/use-terminal-size";
import { useStore } from "../store";
import { getCurrentTheme } from "../utils/theme";
import { HighlightedCode } from "./highlighted-code";

export function Preview() {
  const height = usePanelHeight();
  const panel = useStore((state) => state.panel);
  const selectedResult = useStore((state) => state.selectedResult);
  const theme = getCurrentTheme();

  const lineNumberWidth = useMemo(
    () =>
      selectedResult?.content.snippet.reduce((max, row) => {
        return Math.max(max, String(row.lineNumber).length);
      }, 0),
    [selectedResult],
  );

  return (
    <Box
      paddingX={1}
      height={height}
      borderStyle="single"
      borderColor={
        panel === "preview" ? theme.selectedBorderColor : theme.borderColor
      }
    >
      <Box flexDirection="column" width="100%">
        {selectedResult?.content.snippet.map((row) => {
          return (
            <Box
              key={row.lineNumber}
              gap={1}
              {...(row.hasJump && {
                borderStyle: "bold",
                borderColor: theme.borderColor,
                borderTop: false,
                borderLeft: false,
                borderRight: false,
              })}
            >
              <Box
                justifyContent="flex-end"
                alignItems="flex-start"
                flexShrink={0}
                minWidth={lineNumberWidth ?? 3}
              >
                <Text color="gray">{row.lineNumber}</Text>
              </Box>

              <HighlightedCode
                code={row.code}
                language={
                  selectedResult.path.raw.split(".").pop() ?? "plaintext"
                }
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
