import { ParseResult, Schema } from "effect";
import { parseHtml } from "../../parser";

export const ParsedRow = Schema.Struct({
  lineNumber: Schema.Number,
  code: Schema.String,
  hasJump: Schema.Boolean,
});

export const GrepTestSchema = Schema.transformOrFail(
  Schema.String,
  Schema.Array(ParsedRow),
  {
    strict: true,
    decode(response) {
      const html = parseHtml(response);
      return ParseResult.succeed(html);
    },
    encode() {
      return ParseResult.succeed("");
    },
  },
);

const GrepHitRawSchema = Schema.Struct({
  raw: Schema.String,
});

const GrepHitSchema = Schema.Struct({
  branch: Schema.Struct({ raw: Schema.String }),
  content: Schema.Struct({
    snippet: GrepTestSchema,
  }),
  id: GrepHitRawSchema,
  owner_id: GrepHitRawSchema,
  path: GrepHitRawSchema,
  repo: GrepHitRawSchema,
  total_matches: GrepHitRawSchema,
});

export type GrepHit = Schema.Schema.Type<typeof GrepHitSchema>;

const GrepHitsSchema = Schema.Struct({
  hits: Schema.Array(GrepHitSchema),
  total: Schema.Number,
});

export const GrepResponseSchema = Schema.Struct({
  hits: GrepHitsSchema,
});

export type GrepResponse = Schema.Schema.Type<typeof GrepResponseSchema>;
