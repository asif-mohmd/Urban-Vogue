const userModel = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");



const registerView = (req, res) => {
  res.render("user/register", {
  });
}

//Post Request that handles Register
const registerUser = (req, res) => {
  const { name, email, mobile, gender, password, confirmPassword } = req.body;
  console.log(req.body.confirmPassword)
  if (!name || !email || !mobile || !gender || !password || !confirmPassword) {
    console.log("Fill empty fields");
  }
  //Confirm Passwords
  if (password !== confirmPassword) {
    console.log("Password must match");
  } else {
    //Validation
    userModel.findOne({ email: email }).then((user) => {
      if (user) {
        console.log("email exists");
        res.render("register", {
          name,
          email,
          password,
          confirmPassword,
        });
      } else {
        //Validation
        const newUser = new userModel({
          name,
          email,
          mobile,
          password,
          gender,
          
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

  res.render("user/login", {
  });
}

const loginUser = (req, res) => {
  const { email, password } = req.body;
  console.log(email+" " +password)
  //Required
  if (!email || !password) {
    console.log("Please fill in all the fields");
    res.render("login", {
      email,
      password,
    });
  } else {
    passport.authenticate("local", {
       
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true,
    })(req, res);
  }
};
module.exports = {
  registerView,
  loginView,
  registerUser,
  loginUser
};