import { Box } from "ink";
import { Preview } from "../components/preview";
import { Results } from "../components/results";
import { ApplicationSkeleton } from "./skeleton";

export const ResultsScreen = () => {
  return (
    <ApplicationSkeleton>
      <Box flexDirection="column">
        <Results />
        <Preview />
      </Box>
    </ApplicationSkeleton>
  );
};
