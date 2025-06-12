import { Box, type BoxProps } from "ink";
import type { PropsWithChildren } from "react";
import { useTerminalSize } from "../hooks/use-terminal-size";

export function FullScreen({
  children,
  ...styles
}: PropsWithChildren<BoxProps>) {
  const terminalSize = useTerminalSize();

  return (
    <Box
      height={terminalSize.rows}
      width={terminalSize.columns}
      flexDirection="column"
      {...styles}
    >
      {children}
    </Box>
  );
}
