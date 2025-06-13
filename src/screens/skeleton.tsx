import { Box, type BoxProps, Text, type TextProps } from "ink";
import { useMemo } from "react";
import { FullScreen } from "../components/full-screen";
import { SearchBox } from "../components/search-box";
import Spinner from "../components/vendor/ink-spinner";
import { useGrepRequest } from "../hooks/use-grep-request";
import { useStore } from "../store";
import { getCurrentTheme } from "../utils/theme";
import { VERSION } from "../version";

const UPDATE_AVAILABLE_TEXT = "UPDATE AVAILABLE";

function BoundedText({
  children,
  wrapperProps,
  ...props
}: TextProps & {
  wrapperProps?: BoxProps;
  children: React.ReactNode;
}) {
  return (
    <Box minWidth={UPDATE_AVAILABLE_TEXT.length} {...wrapperProps}>
      <Text {...props}>{children}</Text>
    </Box>
  );
}

export function ApplicationSkeleton({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = getCurrentTheme();
  const selectedResult = useStore((state) => state.selectedResult);
  const updateAvailable = useStore((state) => state.updateAvailable);
  const { hits, totalHits, isFetching, hasNextPage } = useGrepRequest();

  const currentIndex = useMemo(
    () =>
      selectedResult
        ? hits.findIndex((hit) => hit.id.raw === selectedResult.id.raw)
        : -1,
    [selectedResult, hits],
  );

  return (
    <FullScreen>
      <Box
        paddingX={1}
        borderStyle="single"
        borderColor={theme.borderColor}
        borderLeft={false}
        borderRight={false}
        borderTop={false}
        justifyContent="space-between"
      >
        <BoundedText bold>greptui (grep.app)</BoundedText>
        {updateAvailable && (
          <BoundedText bold color="green">
            {UPDATE_AVAILABLE_TEXT}
          </BoundedText>
        )}
        <BoundedText wrapperProps={{ justifyContent: "flex-end" }} dimColor>
          v{VERSION}
        </BoundedText>
      </Box>

      <Box flexDirection="column" gap={0}>
        <SearchBox />

        <Box justifyContent="space-between" paddingX={1}>
          <Text dimColor>
            ↑/↓/TAB to navigate | ENTER to search/open | CTRL+C to quit
          </Text>

          <Box gap={1}>
            {hits.length > 0 && (
              <Text dimColor>
                {currentIndex + 1}/{totalHits} results
              </Text>
            )}
            {hasNextPage && <Text dimColor>+more</Text>}
            {isFetching && <Spinner type="ball" dimColor />}
          </Box>
        </Box>

        {children}
      </Box>
    </FullScreen>
  );
}
