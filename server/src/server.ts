import { app } from "./app";
import { env } from "./config/env";
import { database } from "./config/db";

app.listen(env.port, () => {
  console.log(`SmartCampus API running on port ${env.port}`);
});

process.on("SIGINT", async () => {
  await database.close();
  process.exit(0);
});
