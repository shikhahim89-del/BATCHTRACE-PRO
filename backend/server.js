require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const cors = require("cors");

const app = express();


// ✅ MIDDLEWARE
app.use(express.json());

// ✅ ✅ FIXED CORS (VERY IMPORTANT)
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://batchtrace-pro.vercel.app",   // ✅ YOUR MAIN FRONTEND
      "https://batchtrace-pro-v2.vercel.app" // optional
    ],
    credentials: true,
  })
);

// 🔥 HANDLE PREFLIGHT REQUESTS (IMPORTANT)
app.options("*", cors());


// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("SERVER OK ✅");
});


// ✅ SESSION
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);


// ✅ PASSPORT
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
app.use("/api/auth", authRoutes);


// ✅ MONGODB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log(err));


// ✅ SERVER START
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on ${PORT} 🚀`)
);