require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("API is running...");
});

// Import routes
const clientRoutes = require("./routes/clientRoutes");
app.use("/clients", clientRoutes);

const orderRoutes = require("./routes/orderRoutes");
app.use("/orders", orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Connect to MongoDB
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// Add Swagger
const { swaggerUi, swaggerDocs } = require("./swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
