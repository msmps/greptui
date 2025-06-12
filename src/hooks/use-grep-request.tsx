import { useInfiniteQuery } from "@tanstack/react-query";
import { Effect } from "effect";
import { useMemo } from "react";
import { GrepClient } from "../services/grep/service";
import { useStore } from "../store";

const createGrepRequest = (searchQuery: string, page?: number) =>
  Effect.gen(function* () {
    const grepClient = yield* GrepClient.GrepClient;
    return yield* grepClient.search(searchQuery, page);
  });

const __useGrepRequest = (searchQuery: string) =>
  useInfiniteQuery({
    queryKey: ["grep-request", searchQuery],
    queryFn: ({ pageParam }) =>
      Effect.runPromise(
        createGrepRequest(searchQuery, pageParam).pipe(
          Effect.provide(GrepClient.layer),
        ),
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.hits.hits.length === 0 ? undefined : lastPageParam + 1,
    getPreviousPageParam: (_, __, firstPageParam) =>
      firstPageParam <= 1 ? undefined : firstPageParam - 1,
    refetchOnWindowFocus: false,
    enabled: false,
  });

export const useGrepRequest = () => {
  const searchTerm = useStore((state) => state.searchTerm);
  const { data, ...queryInfo } = __useGrepRequest(searchTerm);

  const hits = useMemo(
    () => data?.pages.flatMap((page) => page.hits.hits) ?? [],
    [data],
  );

  return {
    hits,
    totalHits: data?.pages[0]?.hits.total ?? 0,
    ...queryInfo,
  };
};
