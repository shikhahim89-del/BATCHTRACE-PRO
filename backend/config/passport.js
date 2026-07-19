const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");

passport.use(
  new GoogleStrategy(
    {
      clientID: "YOUR_GOOGLE_CLIENT_ID",
      clientSecret: "YOUR_GOOGLE_CLIENT_SECRET",
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = {
          name: profile.displayName,
          email: profile.emails[0].value,
        };

        // ✅ create JWT
        const token = jwt.sign(user, "SECRET_KEY", { expiresIn: "1d" });

        return done(null, { ...user, token });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;