import { create } from "zustand";
import type { GrepHit } from "./services/grep/schemas";

const panels = [
  {
    id: "search",
    enabled: true,
  },
  {
    id: "results",
    enabled: true,
  },
  {
    id: "filters",
    enabled: false,
  },
  {
    id: "preview",
    enabled: true,
  },
] as const;

type Panels = (typeof panels)[number];

type Panel = Panels["id"];

type State = {
  panel: Panel;
  searchTerm: string;
  scrollPosition: number;
  selectedResult?: GrepHit;
};

type Actions = {
  setScrollPosition: (scrollPosition: State["scrollPosition"]) => void;
  gotoPanel: (panel: Panel) => void;
  gotoNextPanel: () => void;
  gotoPreviousPanel: () => void;
  setSelectedResult: (selectedResult: State["selectedResult"]) => void;
  setSearchTerm: (searchTerm: State["searchTerm"]) => void;
};

type Store = State & {
  actions: Actions;
};

const getNextEnabledPanel = (
  currentPanel: Panel,
  direction: "next" | "previous",
): Panel => {
  const currentIndex = panels.findIndex((p) => p.id === currentPanel);

  const getNextIndex = (index: number): number => {
    if (direction === "next") {
      return (index + 1) % panels.length;
    }

    return index === 0 ? panels.length - 1 : index - 1;
  };

  let targetIndex = getNextIndex(currentIndex);

  while (!panels[targetIndex]?.enabled) {
    targetIndex = getNextIndex(targetIndex);
  }

  return panels[targetIndex]?.id ?? currentPanel;
};

export const useStore = create<Store>((set) => ({
  panel: "search",
  searchTerm: "",
  scrollPosition: 0,
  selectedResult: undefined,
  actions: {
    setScrollPosition: (scrollPosition) => set({ scrollPosition }),
    gotoPanel: (panel) => set({ panel }),
    gotoNextPanel: () =>
      set((state) => ({
        panel: getNextEnabledPanel(state.panel, "next"),
      })),
    gotoPreviousPanel: () =>
      set((state) => ({
        panel: getNextEnabledPanel(state.panel, "previous"),
      })),
    setSelectedResult: (selectedResult) => set({ selectedResult }),
    setSearchTerm: (searchTerm) =>
      set({ searchTerm, selectedResult: undefined, scrollPosition: 0 }),
  },
}));

export const useActions = () => useStore((state) => state.actions);
