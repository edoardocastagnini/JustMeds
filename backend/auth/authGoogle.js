const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Assicurati che questo sia il percorso corretto del modello User
require("dotenv").config(); // Assicurati di caricare il file .env

console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);
console.log("Google Client Secret:", process.env.GOOGLE_CLIENT_SECRET);

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback"
},
async function(accessToken, refreshToken, profile, done) {
  console.log("Google Strategy invoked");
  try {
    let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
      user = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        nome: profile.name.givenName,
        cognome: profile.name.familyName
      });
      console.log("New user created:", user);
    } else {
      console.log("User not found:", user);
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser(function(user, done) {
  done(null, user._id); // Passa solo l'ID dell'utente
});

passport.deserializeUser(async function(id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
