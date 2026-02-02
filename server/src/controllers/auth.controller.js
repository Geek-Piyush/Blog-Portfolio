import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Trim credentials to handle whitespace
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const adminEmail = config.ADMIN_EMAIL?.trim();
    const adminPassword = config.ADMIN_PASSWORD?.trim();

    // Debug logging (only log that check happened, not the actual values for security)
    console.log('Login attempt - Email match:', trimmedEmail === adminEmail);
    console.log('Login attempt - Password match:', trimmedPassword === adminPassword);
    console.log('Admin email configured:', !!adminEmail);
    console.log('Admin password configured:', !!adminPassword);

    // Check against environment variables
    if (trimmedEmail !== adminEmail || trimmedPassword !== adminPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: adminEmail, isAdmin: true },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};
