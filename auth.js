const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function genCode(){
  return Math.random().toString(36).substring(2,8);
}

router.post("/signup", async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10);

  const user = await User.create({
    username: req.body.username,
    password: hash,
    referralCode: genCode(),
    referredBy: req.body.referral || null
  });

  // referral reward
  if(req.body.referral){
    const ref = await User.findOne({ referralCode: req.body.referral });
    if(ref){
      ref.balance += 10;
      await ref.save();
    }
  }

  res.send("Signup success");
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if(!user) return res.send("No user");

  const ok = await bcrypt.compare(req.body.password, user.password);
  if(!ok) return res.send("Wrong password");

  const token = jwt.sign({ id: user._id }, "secret");
  res.json({ token });
});

module.exports = router;