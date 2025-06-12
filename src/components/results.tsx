import { Box, Text } from "ink";
import { useEffect } from "react";
import { useGrepRequest } from "../hooks/use-grep-request";
import { usePanelHeight } from "../hooks/use-terminal-size";
import { useActions, useStore } from "../store";
import { getCurrentTheme } from "../utils/theme";

export function Results() {
  const theme = getCurrentTheme();
  const height = usePanelHeight();
  const panel = useStore((state) => state.panel);
  const selectedResult = useStore((state) => state.selectedResult);
  const scrollPosition = useStore((state) => state.scrollPosition);

  const { setSelectedResult } = useActions();

  const { hits } = useGrepRequest();

  useEffect(() => {
    if (!selectedResult && hits.length > 0) {
      setSelectedResult(hits[0]);
    }
  }, [hits, selectedResult, setSelectedResult]);

  return (
    <Box
      paddingX={1}
      height={height}
      borderStyle="single"
      borderColor={
        panel === "results" ? theme.selectedBorderColor : theme.borderColor
      }
    >
      <Box flexDirection="column" width="100%" overflow="hidden">
        <Box flexDirection="column" marginTop={-scrollPosition}>
          {hits.length > 0
            ? hits.map((hit) => {
                const isSelected = hit.id.raw === selectedResult?.id.raw;

                return (
                  <Box key={hit.id.raw} flexDirection="column" flexShrink={0}>
                    <Box justifyContent="space-between">
                      <Box gap={1}>
                        <Text bold={isSelected}>
                          {`${isSelected ? "> " : ""}${hit.repo.raw}`}
                        </Text>
                        <Text dimColor>{hit.path.raw}</Text>
                      </Box>

                      <Box>
                        <Text>{hit.total_matches.raw} matches</Text>
                      </Box>
                    </Box>
                  </Box>
                );
              })
            : null}
        </Box>
      </Box>
    </Box>
  );
}
