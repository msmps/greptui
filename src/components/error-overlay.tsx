import { Box, Text, useInput } from "ink";
import { getCurrentTheme } from "../utils/theme";

export function ErrorOverlay({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  const theme = getCurrentTheme();

  useInput((input) => {
    if (input.toLowerCase() === "r") {
      resetErrorBoundary();
    }
  });

  return (
    <Box flexDirection="column" padding={1} height="100%" width="100%" gap={1}>
      <Box borderStyle="round" borderColor={theme.errorBorderColor}>
        <Text color="red" bold>
          Application Error
        </Text>
      </Box>

      <Box flexDirection="column" paddingX={1}>
        <Text color="white" bold>
          Error: {error.name || "Unknown Error"}
        </Text>
        <Text color="gray" wrap="wrap">
          {error.message || "An unexpected error occurred"}
        </Text>
      </Box>

      <Box paddingX={1} flexDirection="column">
        <Text color="cyan">Press 'r' to retry or CTRL+C to exit</Text>
      </Box>
    </Box>
  );
}
