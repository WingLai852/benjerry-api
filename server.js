import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import ordersRouter from "./routes/orders.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use("/orders", ordersRouter);

// health
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/", (_req, res) => {
  res.send("Ben & Jerry's API running 🍨");
});

const PORT = process.env.PORT || 4000;

// eerst DB connecteren, dan luisteren
(async () => {
  await connectDB(process.env.MONGODB_URI);
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
})();
