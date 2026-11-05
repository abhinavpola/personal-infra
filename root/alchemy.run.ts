import * as Alchemy from "alchemy";
import * as GCP from "@alchemy.run/gcp";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { REGION, STATE_BUCKET, state } from "./state.ts";

// The bucket that holds Alchemy state for every stack, including this one.
// The state store creates it on first use; this stack adopts and manages it.
export const StateBucket = GCP.Storage.Bucket("StateBucket", {
  bucketName: STATE_BUCKET,
  location: REGION,
  storageClass: "STANDARD",
  versioning: true,
  uniformBucketLevelAccess: true,
  forceDestroy: false,
});

export default Alchemy.Stack(
  "Root",
  {
    providers: GCP.providers().pipe(Layer.provideMerge(GCP.Region(REGION))),
    state: state(),
  },
  Effect.gen(function* () {
    const bucket = yield* StateBucket;
    return { bucketName: bucket.bucketName, location: bucket.location };
  }),
);
