import { Router } from "express";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User, { findOne } from "../models/User";

const router = Router();
const SECRET_KEY = "your_secret_key"; // Replace with an env variable in production

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints for user authentication and authorization
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []  # 👈 Overrides global security (public endpoint)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, password } = req.body;
      let user = await findOne({ email });
      if (user) return res.status(400).json({ message: "Email already in use" });

      user = new User({ name, email, password });
      await user.save();

      res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user and return JWT
 *     tags: [Auth]
 *     security: []  # 👈 Overrides global security (public endpoint)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;
      const user = await findOne({ email });
      if (!user) return res.status(400).json({ message: "Invalid credentials" });

      const isMatch = await compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

      const token = sign({ userId: user._id }, SECRET_KEY, { expiresIn: "1h" });
      res.json({ token });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

export default router;
