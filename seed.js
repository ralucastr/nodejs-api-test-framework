require("dotenv").config();
const mongoose = require("mongoose");
const Client = require("./models/Client");
const Order = require("./models/Order");

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        console.log("Seeding database...");
        
        // Seed Clients
        await Client.deleteMany({});
        const clients = await Client.insertMany([
            { name: "John Doe", email: "john@example.com" },
            { name: "Jane Smith", email: "jane@example.com" },
            { name: "Alice Brown", email: "alice@example.com" },
        ]);

        console.log("Clients seeded successfully!");

        // Seed Orders
        await Order.deleteMany({});
        const orders = clients.map(client => ({
            clientId: client._id,
            items: [
                {
                    productId: new mongoose.Types.ObjectId(), // Placeholder Product ID
                    quantity: Math.floor(Math.random() * 5) + 1 // Random quantity (1-5)
                }
            ],
            totalPrice: Math.floor(Math.random() * 100) + 20, // Random price (20-120)
            status: "pending"
        }));

        await Order.insertMany(orders);
        console.log("Orders seeded successfully!");

        mongoose.connection.close();
    })
    .catch(err => {
        console.error("Seeding Error:", err);
        mongoose.connection.close();
    });
