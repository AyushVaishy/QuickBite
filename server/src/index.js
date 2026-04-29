require("dotenv").config();
const app = require("./app");
const prisma = require("./config/prisma");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  console.log("Starting Cravon backend server...");

  try {
    await prisma.$connect();
    console.log("DB connection: connected");
  } catch (error) {
    console.error("DB connection: failed");
    console.error(error.message);
  }

  app.listen(PORT, () => {
    console.log(`Cravon server running on http://localhost:${PORT}`);
  });
};

startServer();
