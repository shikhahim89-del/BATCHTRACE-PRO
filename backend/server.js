require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const cors = require("cors");

const app = express();

// ✅ Middleware
app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://batchtrace-pro-v2.vercel.app"
  ],
  credentials: true
}));

app.get("/", (req, res) => {
  res.send("SERVER OK ✅");
});

// ✅ Session
app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false
}));

// ✅ Passport
app.use(passport.initialize());
app.use(passport.session());

// ✅ Google Strategy (🔥 FIXED URL)
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// ✅ Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// ✅ MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));

// ✅ PORT FIX (🔥 VERY IMPORTANT)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT} 🚀`));