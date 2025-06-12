import { Box, Text } from "ink";
import { useActions, useStore } from "../store";
import { getCurrentTheme } from "../utils/theme";
import TextInput from "./vendor/ink-text-input";

export function SearchBox() {
  const theme = getCurrentTheme();
  const panel = useStore((state) => state.panel);
  const isFocused = panel === "search";

  const searchTerm = useStore((state) => state.searchTerm);
  const { setSearchTerm } = useActions();

  return (
    <Box
      flexShrink={0}
      borderStyle="single"
      borderColor={isFocused ? theme.selectedBorderColor : theme.borderColor}
    >
      <Text>&gt; </Text>
      <TextInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search"
        focus={isFocused}
      />
    </Box>
  );
}
