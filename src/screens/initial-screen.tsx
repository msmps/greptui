import { Box, Text } from "ink";
import { useTerminalSize } from "../hooks/use-terminal-size";
import { LAYOUT_CONSTANTS } from "../utils/config";
import { getCurrentTheme } from "../utils/theme";
import { ApplicationSkeleton } from "./skeleton";

export function InitialScreen() {
  const theme = getCurrentTheme();
  const terminalSize = useTerminalSize();

  const terminalHeight =
    terminalSize.rows -
    LAYOUT_CONSTANTS.HEADER_HEIGHT -
    LAYOUT_CONSTANTS.SEARCH_BOX_HEIGHT -
    LAYOUT_CONSTANTS.INFO_BAR_HEIGHT;

  return (
    <ApplicationSkeleton>
      <Box
        borderStyle="single"
        borderColor={theme.borderColor}
        height={terminalHeight}
        justifyContent="center"
        alignItems="center"
      >
        <Text>
          Code search made{" "}
          <Text bold italic>
            fast
          </Text>
        </Text>
      </Box>
    </ApplicationSkeleton>
  );
}
