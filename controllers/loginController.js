const User = require("../models/user");
const bcrypt = require("bcryptjs");


const registerView = (req, res) => {
  res.render("user/index", {
  });
}
//Post Request that handles Register
const registerUser = (req, res) => {
  const { name, email, mobile, password, gender, DOB } = req.body;
  if (!name || !email || !password || !confirm) {
    console.log("Fill empty fields");
  }
  //Confirm Passwords
  if (password !== confirm) {
    console.log("Password must match");
  } else {
    //Validation
    User.findOne({ email: email }).then((user) => {
      if (user) {
        console.log("email exists");
        res.render("register", {
          name,
          email,
          password,
          confirm,
        });
      } else {
        //Validation
        const newUser = new User({
          name,
          email,
          mobile,
          password,
          gender,
          DOB
        });
        //Password Hashing
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(res.redirect("/login"))
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
};



// For View 
const loginView = (req, res) => {

  res.render("login", {
  });
}
module.exports = {
  registerView,
  loginView
};