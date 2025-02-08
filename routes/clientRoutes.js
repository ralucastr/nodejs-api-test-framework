const express = require("express");
const Client = require("../models/Client");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Endpoints related to client management
 */

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Get all clients with pagination and filtering
 *     tags: [Clients]
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
 *         description: Number of clients per page (default is 10)
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by client name (case-insensitive)
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by client email (case-insensitive)
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/", async (req, res) => {
    try {
        let { page = 1, limit = 10, name, email } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        let query = {};
        if (name) query.name = new RegExp(name, "i");
        if (email) query.email = new RegExp(email, "i");

        const total = await Client.countDocuments(query);
        const clients = await Client.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .select("-__v"); // ✅ Only exclude `__v`, keep `_id`

        const formattedClients = clients.map(client => ({
            id: client._id.toString(),
            name: client.name,
            email: client.email
        }));

        res.json({
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            data: formattedClients,
        });
    } catch (err) {
        console.error("Error fetching clients:", err);
        res.status(500).json({ message: "Error fetching clients", error: err.message });
    }
});

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Get a client by ID
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Client not found
 *       400:
 *         description: Invalid ID format
 */
router.get("/:id", async (req, res) => {
    try {
        const client = await Client.findById(req.params.id).select("-__v");
        if (!client) return res.status(404).json({ message: "Client not found" });

        res.json({
            id: client._id.toString(),
            name: client.name,
            email: client.email
        });
    } catch (err) {
        res.status(400).json({ message: "Invalid ID format" });
    }
});

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Create a new client
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the client.
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 description: The email of the client.
 *                 example: john.doe@example.com
 *     responses:
 *       201:
 *         description: Client created successfully.
 *       400:
 *         description: Bad request. Invalid input data.
 *       500:
 *         description: Internal server error.
 */
router.post("/", async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: "Name and email are required" });
        }

        const newClient = new Client({ name, email });
        await newClient.save();

        res.status(201).json({
            id: newClient._id.toString(),
            name: newClient.name,
            email: newClient.email
        });
    } catch (err) {
        res.status(400).json({ message: "Error creating client" });
    }
});

/**
 * @swagger
 * /clients/{id}:
 *   put:
 *     summary: Update an existing client by ID
 *     tags: [Clients]
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
 *               name:
 *                 type: string
 *                 description: Updated name of the client.
 *               email:
 *                 type: string
 *                 description: Updated email of the client.
 *     responses:
 *       200:
 *         description: Client updated successfully.
 *       400:
 *         description: Bad request.
 *       404:
 *         description: Client not found.
 */
router.put("/:id", async (req, res) => {
    try {
        const { name, email } = req.body;
        const updatedClient = await Client.findByIdAndUpdate(req.params.id, { name, email }, { new: true });

        if (!updatedClient) {
            return res.status(404).json({ message: "Client not found" });
        }

        res.json({
            id: updatedClient._id.toString(),
            name: updatedClient.name,
            email: updatedClient.email
        });
    } catch (err) {
        res.status(400).json({ message: "Invalid ID format" });
    }
});

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Delete a client by ID
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client deleted successfully.
 *       404:
 *         description: Client not found.
 */
router.delete("/:id", async (req, res) => {
    try {
        const deletedClient = await Client.findByIdAndDelete(req.params.id);
        if (!deletedClient) {
            return res.status(404).json({ message: "Client not found" });
        }

        res.json({ message: "Client deleted successfully" });
    } catch (err) {
        res.status(400).json({ message: "Invalid ID format" });
    }
});

module.exports = router;
