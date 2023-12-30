const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose
  .connect(
    "mongodb+srv://chirag:chirag123@cluster0.ackztg4.mongodb.net/instagram"
  )
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log("error in connecting to DB", err));

var userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    dp: {
      type: String, // url of the image
    },
  },
  { timestamps: true }
);

userSchema.plugin(plm);

const User = mongoose.model("User", userSchema);

module.exports = User;
