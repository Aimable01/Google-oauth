const express = require("express");
const keys = require("./config/keys");
const mongoose = require("mongoose");
const session = require("express-session");
const authRoutes = require("./routes/auth-routes");
const profileRoutes = require("./routes/profile-route");
const passportSetup = require("./config/passport-setup");
const passport = require("passport");
const bodyParser = require("body-parser");

const app = express();

//middle ware
app.set("view engine", "ejs");

app.use(
  session({
    secret: "My secret key",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 },
  })
);

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

//routes
app.get("/", (req, res) => {
  res.render("home");
});

//connect mongodb database
mongoose
  .connect(keys.mongodb.mongoURI)
  .then(() => {
    console.log("Connected to mongodb");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

app.listen(3000, () => console.log("App is running on port 3000"));
