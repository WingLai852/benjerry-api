import { Router } from "express";
import { Order } from "../models/Order.js";
import { isValidObjectId } from "../utils/validateObjectId.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

/**
 * POST /orders
 * Nieuwe bestelling plaatsen (open voor bezoekers)
 */
router.post("/", async (req, res) => {
  try {
    const { customerName, address, items, totalPrice } = req.body;

    if (
      !customerName ||
      !address ||
      !Array.isArray(items) ||
      items.length === 0 ||
      totalPrice == null
    ) {
      return res
        .status(400)
        .json({ error: "customerName, address, items[], totalPrice zijn verplicht" });
    }

    // basisvalidatie per item
    for (const item of items) {
      if (!item.baseFlavor || !item.topping) {
        return res
          .status(400)
          .json({ error: "Elk item heeft baseFlavor en topping nodig" });
      }
    }

    const order = await Order.create({ customerName, address, items, totalPrice });
    res.status(201).json(order);
  } catch (err) {
    console.error("POST /orders error:", err.message);
    res.status(500).json({ error: "Interne serverfout" });
  }
});

/**
 * GET /orders?page=1&limit=10&status=te_verwerken
 * Lijst met paginatie & optionele status-filter (handig voor admin UI)
 */
router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [items, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items,
    });
  } catch (err) {
    console.error("GET /orders error:", err.message);
    res.status(500).json({ error: "Interne serverfout" });
  }
});

/**
 * GET /orders/:id
 * Haal 1 bestelling op (detail view)
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Ongeldig order id" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Bestelling niet gevonden" });

    res.json(order);
  } catch (err) {
    console.error("GET /orders/:id error:", err.message);
    res.status(500).json({ error: "Interne serverfout" });
  }
});

/**
 * PATCH /orders/:id/status
 * Verander status: te_verwerken | verzonden | geannuleerd  (admin)
 */
router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Ongeldig order id" });
    }
    const allowed = ["te_verwerken", "verzonden", "geannuleerd"];
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ error: `status moet één van ${allowed.join(", ")} zijn` });
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: "Bestelling niet gevonden" });

    res.json(order);
  } catch (err) {
    console.error("PATCH /orders/:id/status error:", err.message);
    res.status(500).json({ error: "Interne serverfout" });
  }
});

/**
 * DELETE /orders/:id
 * Verwijder bestelling (admin)
 */
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Ongeldig order id" });
    }

    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Bestelling niet gevonden" });

    res.json({ ok: true, message: "Bestelling verwijderd" });
  } catch (err) {
    console.error("DELETE /orders/:id error:", err.message);
    res.status(500).json({ error: "Interne serverfout" });
  }
});

export default router;
