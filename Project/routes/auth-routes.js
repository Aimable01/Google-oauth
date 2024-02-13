const router = require("express").Router();
const User = require("../models/user-model");
const passport = require("passport");
const e_User = require("../models/e_user_model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/logout", (req, res) => {
  req.logOut(() => console.log("logged out"));
  res.redirect("/auth/login");
});

//the function to verify the token
const verifyToken = (req, res, next) => {
  const token = req.header.authorization;
  console.log(token);
  if (!token) return res.json({ message: "No token found" });

  jwt.verify(token, "secret-key", (err, decoded) => {
    if (err) return res.json({ message: "verification token failed" });

    req.user = decoded;
    next();
  });
};

//register with email
router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await new e_User({
      username,
      email,
      password: hashedPassword,
    });
    await user.save();
    res.redirect("/auth/e_login");
  } catch (err) {
    res.json(err);
  }
});

//login with email
router.get("/e_login", (req, res) => {
  res.render("e_login");
});

router.post("/e_login", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = await e_User.findOne({ email });
    if (!user) return res.json({ message: "no user found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ message: "No password match" });

    const token = await jwt.sign({ username, email }, "secret-key", {
      expiresIn: "1h",
    });
    req.header.authorization = token;

    //res.status(200).json({ user, token: token });
    res.redirect("/auth/e_profile");
  } catch (error) {
    res.status(400).json(error);
  }
});

//the protected router
router.get("/e_profile", verifyToken, (req, res) => {
  console.log(verifyToken);
  //res.json({ user: req.user });
  res.render("e_profile", { user: req.user });
});
//login with google

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile"],
  })
);

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  //res.send(req.user);
  res.redirect("/profile");
});

module.exports = router;
