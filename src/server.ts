import { createApp } from "./createApp";
import { database } from "./db/database";
import { CSV_ORIGINAL } from "./lib/constants";

const PORT = process.env.PORT || 3000;

createApp(CSV_ORIGINAL) // --> change here if you want to start the server with another dataset
  .then((app) => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });

process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  try {
    await database.close();
    console.log("Database closed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error closing database:", error);
    process.exit(1);
  }
});

process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await database.close();
  process.exit(0);
});
