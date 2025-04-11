const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
}, { collection: 'Purchase' });

module.exports = mongoose.model("Purchase", purchaseSchema);
