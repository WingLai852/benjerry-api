import { Router } from "express";
import { Order } from "../models/Order.js";

const router = Router();

// POST /orders - nieuwe bestelling plaatsen
router.post("/", async (req, res) => {
  try {
    const { customerName, address, items, totalPrice } = req.body;

    if (!customerName || !address || !Array.isArray(items) || items.length === 0 || totalPrice == null) {
      return res.status(400).json({ error: "customerName, address, items[], totalPrice zijn verplicht" });
    }

    // simpele check per item
    for (const item of items) {
      if (!item.baseFlavor || !item.topping) {
        return res.status(400).json({ error: "Elk item heeft baseFlavor en topping nodig" });
      }
    }

    const order = await Order.create({ customerName, address, items, totalPrice });
    res.status(201).json(order);
  } catch (err) {
    console.error("POST /orders error:", err.message);
    res.status(500).json({ error: "Interne serverfout" });
  }
});

// GET /orders - alle bestellingen ophalen (voor admin lijst)
router.get("/", async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("GET /orders error:", err.message);
    res.status(500).json({ error: "Interne serverfout" });
  }
});

export default router;
