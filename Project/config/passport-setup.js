const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/user-model");
const keys = require("./keys");

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      //the google strategy
      callbackURL: "/auth/google/redirect",
      clientID: keys.google.clientId,
      clientSecret: keys.google.clientSecret,
    },
    (accessToken, refreshToken, profile, done) => {
      //some call back
      console.log(profile);
      User.findOne({ googleID: profile.id }).then((currentUser) => {
        if (currentUser) {
          console.log(`The current user is ${currentUser}`);
          done(null, currentUser);
        } else {
          new User({
            username: profile.displayName,
            googleID: profile.id,
            thumbnail: profile._json.picture,
          })
            .save()
            .then((newUser) => {
              console.log(`New user saved successfully ${newUser}`);
              done(null, newUser);
            });
        }
      });
    }
  )
);
