require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const cors = require("cors");

const app = express();

// ✅ BODY PARSER
app.use(express.json());

// ✅ CORS (FIXED)
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://batchtrace-pro.vercel.app",
      "https://batchtrace-pro-v2.vercel.app",
    ],
    credentials: true,
  })
);

// ✅ PREFLIGHT (IMPORTANT)
app.options("*", cors());

// ✅ ROOT TEST
app.get("/", (req, res) => {
  res.send("SERVER OK ✅");
});

// ✅ SESSION
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // ⚠️ set true in production (https)
    },
  })
);

// ✅ PASSPORT INIT
app.use(passport.initialize());
app.use(passport.session());

// ✅ GOOGLE STRATEGY
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// ✅ ROUTES
const authRoutes = require("./routes/auth");
const batchRoutes = require("./routes/batches");

app.use("/api/auth", authRoutes);
app.use("/api/batches", batchRoutes);

// ✅ 404 HANDLER
app.use((req, res) => {
  res.status(404).json({ error: "Route not found ❌" });
});

// ✅ DB CONNECT
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("Mongo Error:", err));

// ✅ START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT} 🚀`);
});