import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// health-check (handig voor Render/Vercel pings en voor jezelf)
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// fallback (optioneel, toont dat server leeft)
app.get("/", (req, res) => {
  res.send("Ben & Jerry's API running 🍨");
});

// poort uit env of default
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
