import { defineRailway, project, service } from "railway/iac";

// Last resort for a per-service CaC repo. Prefer one .railway file for the
// project and drop this if you later combine services into that file.
export const partial = "Intranet";

export default defineRailway(() => {
  const Intranet = service("Intranet", {
    build: "npm run build",
    start: "serve -s dist -l $PORT",
    // builder from CaC: "NIXPACKS"
  });
  return project("Intranet", {
    resources: [Intranet],
  });
});
