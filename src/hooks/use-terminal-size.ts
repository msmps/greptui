import { useEffect, useState } from "react";
import { LAYOUT_CONSTANTS } from "../utils/config";

export function useTerminalSize(): { columns: number; rows: number } {
  const [size, setSize] = useState({
    columns: process.stdout.columns || 60,
    rows: process.stdout.rows || 20,
  });

  useEffect(() => {
    function updateSize() {
      setSize({
        columns: process.stdout.columns || 60,
        rows: process.stdout.rows || 20,
      });
    }

    process.stdout.on("resize", updateSize);
    return () => {
      process.stdout.off("resize", updateSize);
    };
  }, []);

  return size;
}

export function usePanelHeight() {
  const terminalSize = useTerminalSize();
  const terminalHeight =
    terminalSize.rows -
    LAYOUT_CONSTANTS.HEADER_HEIGHT -
    LAYOUT_CONSTANTS.SEARCH_BOX_HEIGHT -
    LAYOUT_CONSTANTS.INFO_BAR_HEIGHT;
  return Math.floor(terminalHeight / 2);
}
