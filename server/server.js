require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    if (typeof app.seedDatabase === "function") {
      await app.seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`ReWear server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });
