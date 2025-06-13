import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Box, Text } from "ink";
import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorOverlay } from "./components/error-overlay";
import { FullScreen } from "./components/full-screen";
import { useGrepRequest } from "./hooks/use-grep-request";
import { useKeyboardNavigation } from "./hooks/use-keyboard";
import { useTerminalSize } from "./hooks/use-terminal-size";
import { InitialScreen } from "./screens/initial-screen";
import { NoResultsScreen } from "./screens/no-results-screen";
import { ResultsScreen } from "./screens/results-screen";
import { useActions } from "./store";

const queryClient = new QueryClient();

export const App = ({ isUpdateAvailable }: { isUpdateAvailable: boolean }) => {
  const { setUpdateAvailable } = useActions();

  useEffect(() => {
    setUpdateAvailable(isUpdateAvailable);
  }, [isUpdateAvailable, setUpdateAvailable]);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary FallbackComponent={ErrorOverlay}>
          <AppInner />
        </ErrorBoundary>
      </QueryClientProvider>
    </>
  );
};

const AppInner = () => {
  useKeyboardNavigation();

  const terminalSize = useTerminalSize();
  const { error, isSuccess, totalHits } = useGrepRequest();

  if (error) {
    return (
      <FullScreen>
        <Box
          flexDirection="column"
          flexGrow={1}
          alignItems="center"
          justifyContent="center"
          height={terminalSize.rows}
        >
          <Text color="red">{error?.message || "No results found"}</Text>
          <Text color="gray">Press 'q' to quit</Text>
          {error && (
            <Text color="gray">
              Error details: {JSON.stringify(error, null, 2)}
            </Text>
          )}
        </Box>
      </FullScreen>
    );
  }

  if (isSuccess && totalHits === 0) {
    return <NoResultsScreen />;
  }

  if (isSuccess) {
    return <ResultsScreen />;
  }

  return <InitialScreen />;
};
