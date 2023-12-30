var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const passport = require("passport");
const localStrategy = require("passport-local");
const upload = require("./multer");

passport.use(new localStrategy(userModel.authenticate()));

router.get("/", function (req, res) {
  res.render("index", { footer: false });
});

router.get("/login", function (req, res) {
  res.render("login", { footer: false });
});

router.get("/feed", isLoggedIn, async function (req, res) {
  const posts = await postModel.find({}).populate("user");
  res.render("feed", { footer: true, posts });
});

router.get("/profile", isLoggedIn, async function (req, res) {
  const user = await userModel.findById(req.user._id).populate("posts");
  res.render("profile", { footer: true, user });
});

router.get("/search", isLoggedIn, function (req, res) {
  res.render("search", { footer: true });
});

router.get("/edit", isLoggedIn, async function (req, res) {
  const user = await userModel.findById(req.user._id);
  res.render("edit", { footer: true, user });
});

router.get("/upload", isLoggedIn, function (req, res) {
  res.render("upload", { footer: true });
});
router.get("/username/:username", isLoggedIn, async function (req, res) {
  const regex = new RegExp(`^${req.params.username}`, "i");
  const users = await userModel.find({ username: regex });
  res.json(users);

});

router.post("/register", function (req, res) {
  userModel.register(
    {
      username: req.body.username,
      email: req.body.email,
      name: req.body.name,
    },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log("error in registering cheak all fields", err);
        res.redirect("/login");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/profile");
        });
      }
    }
  );
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
  }),
  function (req, res) { }
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      console.log("error in logging out", err);
      return next(err);
    }
    res.redirect("/");
  });
});

router.post("/update", upload.single("image"), async function (req, res) {
  const user = await userModel.findOneAndUpdate(
    { _id: req.user._id },
    { name: req.body.name, username: req.body.username, bio: req.body.bio }
  );
  if (req.file) {
    user.dp = req.file.filename;
  }
  await user.save();
  res.redirect("/profile");
});

router.post("/upload", isLoggedIn, upload.single("image"), async function (req, res) {
  const user = await userModel.findById(req.user._id);
  const post = await postModel.create({
    caption: req.body.caption,
    image: req.file.filename,
    user: req.user._id,
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/feed");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

module.exports = router;
