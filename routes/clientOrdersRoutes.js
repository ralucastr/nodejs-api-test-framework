import { Router } from "express";
import Order, { find, findOne, findOneAndUpdate, findOneAndDelete } from "../models/Order";
import { findById } from "../models/Product";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Client Orders
 *   description: Endpoints related to client orders
 */

/**
 * @swagger
 * /clients/{clientId}/orders:
 *   get:
 *     summary: Get all orders for a specific client
 *     tags: [Client Orders]
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/:clientId/orders", authMiddleware, async (req, res) => {
  try {
    const orders = await find({ clientId: req.params.clientId })
      .populate("items.productId", "name price")
      .select("-__v");
    res.json(orders);
  } catch (err) {
    res.status(400).json({ message: "Error fetching client orders", error: err.message });
  }
});

/**
 * @swagger
 * /clients/{clientId}/orders:
 *   post:
 *     summary: Create an order for a specific client
 *     tags: [Client Orders]
 */
router.post("/:clientId/orders", authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    let totalPrice = 0;
    for (let item of items) {
      const product = await findById(item.productId);
      if (!product) return res.status(400).json({ message: `Invalid product ID: ${item.productId}` });
      totalPrice += product.price * item.quantity;
    }
    const newOrder = new Order({ clientId: req.params.clientId, items, totalPrice });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: "Error creating order", error: err.message });
  }
});

/**
 * @swagger
 * /clients/{clientId}/orders/{orderId}:
 *   get:
 *     summary: Get a specific order for a client
 *     tags: [Client Orders]
 */
router.get("/:clientId/orders/:orderId", authMiddleware, async (req, res) => {
  try {
    const order = await findOne({ _id: req.params.orderId, clientId: req.params.clientId })
      .populate("items.productId", "name price")
      .select("-__v");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: "Error fetching order", error: err.message });
  }
});

/**
 * @swagger
 * /clients/{clientId}/orders/{orderId}:
 *   put:
 *     summary: Update an order for a client
 *     tags: [Client Orders]
 */
router.put("/:clientId/orders/:orderId", authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    let totalPrice = 0;
    for (let item of items) {
      const product = await findById(item.productId);
      if (!product) return res.status(400).json({ message: `Invalid product ID: ${item.productId}` });
      totalPrice += product.price * item.quantity;
    }
    const order = await findOneAndUpdate({ _id: req.params.orderId, clientId: req.params.clientId }, { items, totalPrice }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: "Error updating order", error: err.message });
  }
});

/**
 * @swagger
 * /clients/{clientId}/orders/{orderId}:
 *   delete:
 *     summary: Delete an order for a client
 *     tags: [Client Orders]
 */
router.delete("/:clientId/orders/:orderId", authMiddleware, async (req, res) => {
  try {
    const order = await findOneAndDelete({ _id: req.params.orderId, clientId: req.params.clientId });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Error deleting order", error: err.message });
  }
});

export default router;
