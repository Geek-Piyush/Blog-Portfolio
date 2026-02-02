import app from "./src/app.js";
import { config } from "./src/config/env.js";
import { connectDB } from "./src/config/db.js";

const startServer = async () => {
  await connectDB();
  
  app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
  });
};

startServer();
