import { createApp } from "./createApp";
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
