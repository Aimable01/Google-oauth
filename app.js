const express = require("express");
const ejs = require("ejs");
const session = require("express-session");
const authRoutes = require("./routes/auth-routes");
const profileRoutes = require("./routes/profile-routes");
const passportSetup = require("./config/passport-setup");
const mongoose = require("mongoose");
const keys = require("./config/keys");
const cookieSession = require("cookie-session");
const passport = require("passport");

const app = express();

app.set("view engine", "ejs");

app.use(
  session({
    secret: keys.session.cookieKey,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 },
  })
);

// --------Note very carefully that the older version of this does not support modern express-session

// app.use(
//   cookieSession({
//     maxAge: 60 * 60 * 1000,
//     keys: [keys.session.cookieKey],
//   })
// );

//initialize passport
app.use(passport.initialize());
app.use(passport.session());

//connect to mongodb
mongoose
  .connect(keys.mongodb.dbURI)
  .then(() => console.log("connected to mongodb"))
  .catch((err) => console.log(`Failed to connect to mongodb, ${err}`));

//setup routes
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

//home route
app.get("/", (req, res) => {
  res.render("home", { user: req.user });
});

//port
app.listen(4000, () => console.log("App running on port 4000"));
