import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

// POST /auth/login  { password: "..." }
router.post("/login", (req, res) => {
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: "password is required" });

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { role: "admin" }, 
    process.env.ADMIN_JWT_SECRET, 
    { expiresIn: "8h" } 
  );

  res.json({ token });
});

export default router;
