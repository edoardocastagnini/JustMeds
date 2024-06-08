const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); 
require("dotenv").config(); 

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://justmeds.onrender.com/api/google/callback"
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
      await user.save();
      console.log("New user created:", user);
    } else {
      console.log("User found:", user);
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser(function(user, done) {
  done(null, user._id); 
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
