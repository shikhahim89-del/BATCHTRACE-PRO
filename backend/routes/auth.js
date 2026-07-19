const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const passport = require("passport");

const User = require("../models/User");

// RATE LIMIT
const limiter = rateLimit({
  windowMs: 60000,
  max: 3
});

// REGISTER
router.post("/register",
  limiter,
  body("email").isEmail(),
  body("password").isLength({ min: 5 }),
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors });
    }

    const { email, password } = req.body;

    // ✅ duplicate check
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    await User.create({ email, password: hash });

    res.json({ msg: "Registered Successfully" });
  }
);

// LOGIN
router.post("/login",
  limiter,
  async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, "secret", { expiresIn: "1h" });

    res.json({ token });
  }
);

// ✅ GOOGLE LOGIN
router.get("/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

// ✅ GOOGLE CALLBACK (FIXED)
router.get("/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:3000/" // ✅ frontend login page
  }),
  (req, res) => {

    // 🔥 CREATE TOKEN
    const token = jwt.sign(
      { id: req.user._id },
      "secret",
      { expiresIn: "1h" }
    );

    // ✅ SEND TOKEN TO FRONTEND
    res.redirect(`http://localhost:3000/dashboard?token=${token}`);
  }
);