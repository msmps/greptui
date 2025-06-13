import { Schema } from "effect";

export const UpdateState = Schema.Struct({
  lastChecked: Schema.Number,
});

export type UpdateCheckResult = Schema.Schema.Type<Schema.Boolean>;
