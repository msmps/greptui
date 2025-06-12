import { useApp, useInput } from "ink";
import open from "open";
import { useActions, useStore } from "../store";
import { LAYOUT_CONSTANTS } from "../utils/config";
import { useGrepRequest } from "./use-grep-request";
import { usePanelHeight } from "./use-terminal-size";

const useKeyboardHandlers = () => {
  const { exit } = useApp();
  const panelHeight = usePanelHeight();

  const panel = useStore((state) => state.panel);
  const searchTerm = useStore((state) => state.searchTerm);
  const selectedResult = useStore((state) => state.selectedResult);
  const scrollPosition = useStore((state) => state.scrollPosition);

  const {
    gotoNextPanel,
    gotoPreviousPanel,
    setSelectedResult,
    setScrollPosition,
  } = useActions();

  const {
    error,
    refetch: handleSearch,
    hasNextPage,
    fetchNextPage,
    hits,
  } = useGrepRequest();

  const handleQuitOnError = (input: string) => {
    if (error && input.toLowerCase() === "q") {
      exit();
      return true;
    }
    return false;
  };

  const handleTabNavigation = (key: { tab?: boolean; shift?: boolean }) => {
    if (key.tab) {
      if (key.shift) {
        gotoPreviousPanel();
      } else {
        gotoNextPanel();
      }
      return true;
    }
    return false;
  };

  const handleEnterAction = () => {
    if (panel === "results" && selectedResult) {
      const url = `https://github.com/${selectedResult.repo.raw}/blob/${selectedResult.branch.raw}/${selectedResult.path.raw}`;
      open(url);
      return true;
    }

    if (panel === "search" && searchTerm) {
      handleSearch();
      return true;
    }
    return false;
  };

  const handleUpArrow = () => {
    if (!hits || panel !== "results") return false;

    const currentIndex = selectedResult
      ? hits.findIndex((hit) => hit.id.raw === selectedResult.id.raw)
      : -1;

    const prevIndex = Math.max(0, currentIndex - 1);
    const newResult = hits[prevIndex];

    if (newResult) {
      setSelectedResult(newResult);
      setScrollPosition(Math.max(0, scrollPosition - 1));
    }
    return true;
  };

  const handleDownArrow = () => {
    if (!hits || panel !== "results") return false;

    const currentIndex = selectedResult
      ? hits.findIndex((hit) => hit.id.raw === selectedResult.id.raw)
      : -1;

    const visibleResults = panelHeight - LAYOUT_CONSTANTS.PANEL_BORDER_SIZE;
    const nextIndex = Math.min((hits.length || 1) - 1, currentIndex + 1);
    const newResult = hits[nextIndex];

    if (newResult) {
      setSelectedResult(newResult);

      if (nextIndex >= scrollPosition + visibleResults) {
        setScrollPosition(Math.max(0, nextIndex - visibleResults + 1));
      }
    }

    if (nextIndex === hits.length - 1 && hasNextPage) {
      fetchNextPage();
    }
    return true;
  };

  return {
    handleQuitOnError,
    handleTabNavigation,
    handleEnterAction,
    handleUpArrow,
    handleDownArrow,
  };
};

export function useKeyboardNavigation() {
  const {
    handleQuitOnError,
    handleTabNavigation,
    handleEnterAction,
    handleUpArrow,
    handleDownArrow,
  } = useKeyboardHandlers();

  useInput((input, key) => {
    // Handle quit on error
    if (handleQuitOnError(input)) return;

    // Handle tab navigation
    if (handleTabNavigation(key)) return;

    // Handle enter actions
    if (key.return && handleEnterAction()) return;

    // Handle arrow navigation
    if (key.upArrow && handleUpArrow()) return;
    if (key.downArrow && handleDownArrow()) return;
  });
}
