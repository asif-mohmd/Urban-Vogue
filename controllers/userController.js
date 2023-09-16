const bcrypt = require("bcryptjs");
const saltRounds = 10;
const userModel = require("../models/User");
var session = require('express-session');
const ProductModel = require("../models/Product");
const sendMail = require("../utils/nodeMailer")


const verifyLogin = (req, res, next) => {
  if (req.session.user) {
    next()
  } else {
    return res.redirect("/login")
  }
}


const loginChecker = (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/")
  } else {
    next()
  }
}


const indexView = async (req, res) => {
  const products = await ProductModel.find()
  res.render("user/index", { products });
}


const registerView = (req, res) => {
  res.render("user/register", {});
}


const otpView = (req, res) => {
  res.render("user/otp")
}


const otpVerification = async (req, res) => {

  const { otpNum1, otpNum2, otpNum3, otpNum4, otpNum5, otpNum6 } = req.body
  const combinedOTP = otpNum1 + otpNum2 + otpNum3 + otpNum4 + otpNum5 + otpNum6;
  if (combinedOTP == session.otp) {
    data = session.userData
    const user = await userModel.create(data)
    res.redirect("/")
  } else {
    msg = true
    res.render("user/otp", { msg })
  }
}


const registerUser = async (req, res) => {
  const { name, email, mobile, gender, password, confirmPassword } = req.body;
  await sendMail(email)
  console.log(req.body.confirmPassword);
  if (password !== confirmPassword) {
    console.log("Password must match");
  } else {
    userModel.findOne({ email: email }).then(async (user) => {
      if (user) {
        console.log("email exists");
      } else {
        data = {
          "name": name,
          "email": email,
          "mobile": mobile,
          "gender": gender,
          "password": password,
          "status": true
        }
        console.log(data, "dataatatataaa")
        data.password = await bcrypt.hash(data.password, saltRounds)
        session.userData = data
        if (session.userData) {
          console.log("Successfuly registered")
          res.render("user/otp")
        } else {
          msg = true
          console.log("Registration failed")
          res.render("user/register", { msg })
        }
      }
    });
  }
};


const loginView = (req, res) => {
  res.render("user/login", {});
}


const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email: email })
  if (user) {
    const data = await bcrypt.compare(password, user.password)
    if (data) {
      req.session.user = user
      res.redirect("/")
    } else {
      msgPass = true
      res.render("user/login", { msgPass })
    }
  } else {
    msgEmail = true
    res.render("user/login", { msgEmail })
  }
}


module.exports = {
  registerView,
  loginView,
  otpView,
  registerUser,
  loginUser,
  indexView,
  verifyLogin,
  loginChecker,
  otpVerification,


};

