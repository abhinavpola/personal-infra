import * as Alchemy from "alchemy";
import * as GCP from "@alchemy.run/gcp";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export const Cluster = GCP.Container.Cluster("Cluster", {
  clusterId: "autopilot-usw1",
  location: "us-west1", // Autopilot requires a region, not a zone
  autopilot: true,
  releaseChannel: "REGULAR",
});

export default Alchemy.Stack(
  "PersonalInfra",
  {
    providers: GCP.providers().pipe(
      Layer.provideMerge(GCP.Region("us-west1")),
    ),
    state: Alchemy.localState(),
  },
  Effect.gen(function* () {
    const cluster = yield* Cluster;
    return {
      clusterId: cluster.clusterId,
      location: cluster.location,
      endpoint: cluster.endpoint,
      status: cluster.status,
    };
  }),
);
