const bcrypt = require("bcryptjs");
const saltRounds = 10;
const userModel = require("../models/User");
var session = require('express-session');
const ProductModel = require("../models/Product");
const sendMail = require("../utils/nodeMailer")





const indexView = async (req, res) => {
  
  const products = await ProductModel.find({status:true})
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

  try {
    // Simulate sending an email (replace with actual sendMail function)
    await sendMail(email);

    if (password !== confirmPassword) {
      // Handle password mismatch error
      throw new Error("Password and confirm password do not match");
    }
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      // Handle existing email error
      throw new Error("Email already exists");
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const data = {
      name,
      email,
      mobile,
      gender,
      password: hashedPassword,
      status: true,
    };
    session.userData = data;

    res.render("user/otp");
  } catch (error) {
    // Handle the error
    console.error("An error occurred:", error.message);

    let msg;
    if (error.message === "Password and confirm password do not match" || 
        error.message === "Email already exists") {
      msg = true;
    }

    res.render("user/register", { msg });
  }
};


const loginView = (req, res) => {
  res.render("user/login", {});
}


const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      throw new Error("Invalid email");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      if (user.status) {
        req.session.user = user;
        res.redirect("/");
      } else {
        throw new Error("User is blocked");
      }
    } else {
      throw new Error("Invalid password");
    }
  } catch (error) {
    // Handle the error
    console.error("An error occurred:", error.message);

    let msg;
    if (
      error.message === "Invalid email" ||
      error.message === "Invalid password"
    ) {
      msg = true;
    } else if (error.message === "User is blocked") {
      msgBlock = true;
    }

    res.render("user/login", { msg, msgBlock });
  }
};



module.exports = {
  registerView,
  loginView,
  otpView,
  registerUser,
  loginUser,
  indexView,
  otpVerification,

};

