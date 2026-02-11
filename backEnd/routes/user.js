// routes/user.js
const express = require("express");
const prisma = require("../db");            // your Prisma client
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");          // you installed 'bcrypt'

// Register
router.post("/register", async (req, res) => {
  try {
    console.log('[REGISTER] body =', req.body);
    const { email, userName, passWord, role } = req.body;

    if (!email || !userName || !passWord) {
      return res.status(400).json({ error: "Missing fields (email, userName, passWord required)" });
    }

    const hashedpassWord = await bcrypt.hash(passWord, 10);

    const user = await prisma.user.create({
      data: {
        email,
        userName,
        passWord: hashedpassWord,
        role,
      },
    });

    // do not expose passWord hash
    res.status(201).json({ id: user.id, email: user.email, userName: user.userName });
  } catch (error) {
    console.error("Register error:", error && error.stack ? error.stack : error);
    res.status(500).json({ error: "Internal Server Error", details: String(error.message || error) });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    console.log('[LOGIN] body =', req.body);
    const { email, passWord } = req.body;

    if (!email || !passWord) {
      return res.status(400).json({ error: "email and passWord are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    console.log('[LOGIN] db user =', user ? { id: user.id, email: user.email, userName: user.userName } : null);

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    if (!user.passWord) {
      console.error('[LOGIN] user.passWord is missing in DB record');
      return res.status(500).json({ error: 'Server user record malformed (passWord missing)' });
    }

    const valid = await bcrypt.compare(passWord, user.passWord);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "supersecret", { expiresIn: "1d" });

    res.json({
      token,
      user: { id: user.id, email: user.email, userName: user.userName },
    });
  } catch (error) {
    console.error("Login error:", error && error.stack ? error.stack : error);
    res.status(500).json({ error: "Internal Server Error", details: String(error.message || error) });
  }
});

module.exports = router;
