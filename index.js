require("dotenv").config();
import express, { json } from "express";
import cors from "cors";

const app = express();
app.use(json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("API is running...");
});

// Import routes
import authRoutes from "./routes/authRoutes";
app.use("/auth", authRoutes);

import clientRoutes from "./routes/clientRoutes";
app.use("/clients", clientRoutes);

import orderRoutes from "./routes/orderRoutes";
app.use("/orders", orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Connect to MongoDB
import { connect } from "mongoose";
connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// Add Swagger
import { swaggerUi, swaggerDocs } from "./swagger";
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
