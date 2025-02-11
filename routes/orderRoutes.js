const express = require("express");
const Order = require("../models/Order");
const Client = require("../models/Client");
const router = express.Router();
const Product = require("../models/Product");

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Endpoints related to order management
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders with pagination & filtering
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of orders per page (default is 10)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, shipped, delivered, canceled]
 *         description: Filter orders by status
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/", async (req, res) => {
    try {
        let { page = 1, limit = 10, status } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        let query = {};
        if (status) query.status = status;

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("clientId", "name email")
            .populate("items.productId", "name price")
            .select("-__v")
            .lean();

        orders.forEach(order => {
            order.id = order._id;
            order.client = order.clientId;
            if (order.client) {
                order.client.id = order.client._id;
                delete order.client._id;
            }
            delete order.clientId;
        });
        orders.forEach(order => delete order._id);


        res.json({ total, page, limit, totalPages: Math.ceil(total / limit), data: orders });
    } catch (err) {
        res.status(500).json({ message: "Error fetching orders", error: err.message });
    }
});

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Order not found
 */
router.get("/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("clientId", "name email")
            .populate("items.productId", "name price")
            .select("-__v")
            .lean();

        if (!order) return res.status(404).json({ message: "Order not found" });
        order.id = order._id;
        delete order._id;
        res.json(order);
    } catch (err) {
        res.status(400).json({ message: "Invalid ID format" });
    }
});

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order with automatic price calculation
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientId:
 *                 type: string
 *                 description: The ID of the client placing the order.
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       description: The product ID.
 *                     quantity:
 *                       type: integer
 *                       description: Quantity of the product.
 *     responses:
 *       201:
 *         description: Order created successfully.
 */
router.post("/", async (req, res) => {
    try {
        const { clientId, items } = req.body;

        const clientExists = await Client.findById(clientId);
        if (!clientExists) return res.status(400).json({ message: "Invalid client ID" });

        let totalPrice = 0;
        for (let item of items) {
            const product = await Product.findById(item.productId);
            if (!product) return res.status(400).json({ message: `Invalid product ID: ${item.productId}` });
            totalPrice += product.price * item.quantity;
        }

        const newOrder = new Order({ clientId, items, totalPrice });
        await newOrder.save();

        res.status(201).json(newOrder);
    } catch (err) {
        res.status(400).json({ message: "Error creating order", error: err.message });
    }
});

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Order updated successfully.
 */
router.put("/:id", async (req, res) => {
    try {
        const { items } = req.body;
        let totalPrice = 0;
        for (let item of items) {
            const product = await Product.findById(item.productId);
            if (!product) return res.status(400).json({ message: `Invalid product ID: ${item.productId}` });
            totalPrice += product.price * item.quantity;
        }
        const order = await Order.findByIdAndUpdate(req.params.id, { items, totalPrice }, { new: true });
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    } catch (err) {
        res.status(400).json({ message: "Error updating order", error: err.message });
    }
});

/**
 * @swagger
 * /orders/{id}/cancel:
 *   patch:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order canceled successfully.
 */
router.patch("/:id/cancel", async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { status: "canceled" }, { new: true });
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    } catch (err) {
        res.status(400).json({ message: "Error canceling order", error: err.message });
    }
});

/**
 * @swagger
 * /clients/{clientId}/orders:
 *   get:
 *     summary: Get all orders for a specific client
 *     tags: [Orders]
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
router.get("/clients/:clientId/orders", async (req, res) => {
    try {
        const orders = await Order.find({ clientId: req.params.clientId })
            .populate("items.productId", "name price")
            .select("-__v");
        res.json(orders);
    } catch (err) {
        res.status(400).json({ message: "Error fetching client orders", error: err.message });
    }
});

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order deleted successfully.
 */
router.delete("/:id", async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        res.json({ message: "Order deleted successfully" });
    } catch (err) {
        res.status(400).json({ message: "Invalid ID format" });
    }
});

module.exports = router;
