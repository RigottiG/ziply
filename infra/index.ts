import * as digitalocean from "@pulumi/digitalocean";

const app = new digitalocean.App("ziply-app", {
  spec: {
    name: "ziply",
    region: "nyc3",
    domainNames: [
      {
        name: "ziply.rigotti.dev",
        type: "PRIMARY",
      },
    ],
    services: [
      {
        name: "ziply-service",
        github: {
          repo: "RigottiG/ziply",
          branch: "main",
          deployOnPush: true,
        },
        instanceSizeSlug: "professional-s",
        instanceCount: 1,
        httpPort: 3001,
        dockerfilePath: "Dockerfile",
        envs: [
          {
            key: "NODE_ENV",
            value: "production",
          },
        ],
      },
    ],
  },
});

export const defaultAppUrl = app.defaultIngress;
export const liveUrl = app.liveUrl;
