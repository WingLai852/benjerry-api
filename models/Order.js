import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    // Minstens 2 zinvolle parameters voor je custom ijs
    baseFlavor: { type: String, required: true },   // bv. vanilla, chocolate
    topping: { type: String, required: true },      // bv. oreo, caramel
    size: { type: String, enum: ["small", "medium", "large"], default: "medium" } // extra parameter (mag)
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    address: { type: String, required: true },
    items: { type: [OrderItemSchema], validate: v => v.length > 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: { 
      type: String, 
      enum: ["te_verwerken", "verzonden", "geannuleerd"], 
      default: "te_verwerken" 
    }
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", OrderSchema);
