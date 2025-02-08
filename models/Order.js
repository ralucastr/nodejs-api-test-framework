const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true, min: 1 }
        }
    ],
    totalPrice: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ["pending", "shipped", "delivered", "canceled"], 
        default: "pending" 
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", OrderSchema);
