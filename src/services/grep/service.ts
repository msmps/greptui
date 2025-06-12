import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";
import type { HttpClientError } from "@effect/platform/HttpClientError";
import { Context, Effect, Layer, Schedule } from "effect";
import type { ParseError } from "effect/ParseResult";
import { API_CONFIG } from "../../utils/config";
import { type GrepResponse, GrepResponseSchema } from "./schemas";

export namespace GrepClient {
  export type Service = Readonly<{
    search: (
      searchQuery: string,
      page?: number,
    ) => Effect.Effect<GrepResponse, HttpClientError | ParseError, never>;
  }>;

  export class GrepClient extends Context.Tag("GrepClient")<
    GrepClient,
    Service
  >() {}

  const createService = () =>
    Effect.gen(function* () {
      const httpClient = (yield* HttpClient.HttpClient).pipe(
        HttpClient.mapRequest(
          HttpClientRequest.prependUrl(API_CONFIG.BASE_URL),
        ),
        HttpClient.mapRequest(
          HttpClientRequest.setHeader("User-Agent", API_CONFIG.USER_AGENT),
        ),
        HttpClient.retryTransient({
          schedule: Schedule.intersect(
            Schedule.spaced(API_CONFIG.RETRY_DELAY),
            Schedule.recurs(API_CONFIG.RETRY_ATTEMPTS),
          ),
        }),
      );

      return {
        search: (searchQuery: string, page?: number) => {
          const searchParams = new URLSearchParams({
            q: searchQuery,
            ...(page && { page: page.toString() }),
          });

          return httpClient
            .get(`/search?${searchParams.toString()}`)
            .pipe(
              Effect.flatMap(
                HttpClientResponse.schemaBodyJson(GrepResponseSchema),
              ),
            );
        },
      };
    });

  const layerWithoutDependencies = Layer.effect(GrepClient, createService());

  export const layer = layerWithoutDependencies.pipe(
    Layer.provide(FetchHttpClient.layer),
  );
}
