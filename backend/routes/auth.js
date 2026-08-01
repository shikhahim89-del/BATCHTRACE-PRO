const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const passport = require("passport");

const User = require("../models/User");

// ✅ Rate limit
const limiter = rateLimit({
  windowMs: 60000,
  max: 3
});

// ✅ REGISTER
router.post("/register",
  limiter,
  body("email").isEmail(),
  body("password").isLength({ min: 5 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors });
      }

      const { email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ msg: "User already exists" });
      }

      const hash = await bcrypt.hash(password, 10);
      await User.create({ email, password: hash });

      res.json({ msg: "Registered Successfully" });

    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// ✅ LOGIN
router.post("/login",
  limiter,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1h" }
      );

      res.json({ token });

    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// ✅ GOOGLE LOGIN
router.get("/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

// ✅ GOOGLE CALLBACK (🔥 FIXED FRONTEND URL)
router.get("/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: process.env.FRONTEND_URL
  }),
  (req, res) => {

    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
  }
);

module.exports = router;