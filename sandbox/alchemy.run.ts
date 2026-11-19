import * as GCP from "@alchemy.run/gcp";
import * as Alchemy from "alchemy";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";

import { REGION, state } from "../root/state.ts";

export const Cluster = GCP.Container.Cluster("Cluster", {
  clusterId: "autopilot-usw1",
  location: REGION, // Autopilot requires a region, not a zone
  autopilot: true,
  releaseChannel: "REGULAR",
});

// NOTE: Looked up at deploy time to keep the project number out of this public repo.
const projectNumber = (
  project: string,
  accessToken: Redacted.Redacted<string>,
) =>
  Effect.tryPromise(async () => {
    const res = await fetch(
      `https://cloudresourcemanager.googleapis.com/v3/projects/${project}`,
      {
        headers: { authorization: `Bearer ${Redacted.value(accessToken)}` },
      },
    );
    if (!res.ok) throw new Error(`project lookup failed: ${res.status}`);
    const { name } = (await res.json()) as { name: string };
    return name.replace("projects/", "");
  });

// NOTE: Autopilot nodes run as the default compute service account, which GCP grants project
// Editor. This is the minimal role GKE nodes need, so Editor can be removed from it by hand.
const NodeServiceAccountRole = Effect.gen(function* () {
  const { project, accessToken } = yield* GCP.GcpEnvironment.current.pipe(
    Effect.orDie,
  );
  const number = yield* projectNumber(project, accessToken).pipe(Effect.orDie);
  return yield* GCP.IAM.Member("NodeServiceAccountRole", {
    kind: "project",
    name: project,
    role: "roles/container.defaultNodeServiceAccount",
    member: `serviceAccount:${number}-compute@developer.gserviceaccount.com`,
  });
});

export default Alchemy.Stack(
  "PersonalInfra",
  {
    providers: GCP.providers().pipe(Layer.provideMerge(GCP.Region(REGION))),
    state: state(),
  },
  Effect.gen(function* () {
    const cluster = yield* Cluster;
    yield* NodeServiceAccountRole;
    return {
      clusterId: cluster.clusterId,
      location: cluster.location,
      endpoint: cluster.endpoint,
      status: cluster.status,
    };
  }),
);
