require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const cors = require("cors");

const app = express();

// ===== BASIC =====
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.get("/", (req, res) => {
  res.send("SERVER OK ✅");
});

// ===== SESSION =====
app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false
}));

// ===== PASSPORT =====
app.use(passport.initialize());
app.use(passport.session());

// ===== GOOGLE STRATEGY =====
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/api/auth/google/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// ===== ROUTES =====
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// ===== MONGO =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));

// ===== START =====
app.listen(5000, () => console.log("Server running on 5000 🚀"));