import * as GCP from "@alchemy.run/gcp";

export const REGION = "us-west1";

// Regional STANDARD storage in us-west1 falls under the GCS free tier.
export const STATE_BUCKET = "alchemy-state-personal-infra-abhinavpola";

/** State store shared by every stack in this repo. */
export const state = () =>
  GCP.state({ bucketName: STATE_BUCKET, location: REGION });
