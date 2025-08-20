import jwt from "jsonwebtoken";

export function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "No token provided" });

    const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    // optioneel: payload.role === 'admin' check
    req.admin = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
