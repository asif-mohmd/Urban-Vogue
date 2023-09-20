const bcrypt = require("bcryptjs");
const saltRounds = 10;
const userModel = require("../models/User");
var session = require('express-session');
const ProductModel = require("../models/Product");
const sendMail = require("../utils/nodeMailer")





const indexView = async (req, res) => {

  const products = await ProductModel.find({ status: true })
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
  if (password !== confirmPassword) {
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
        data.password = await bcrypt.hash(data.password, saltRounds)
        session.userData = data
        if (session.userData) {
          res.render("user/otp")
        } else {
          msg = true
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
      if (user.status == true) {
        req.session.user = user
        res.redirect("/")
      } else {
        msgBlock = true
        res.render("user/login", { msgBlock })
      }

    } else {
      msgPass = true
      res.render("user/login", { msgPass })
    }
  } else {
    msgEmail = true
    res.render("user/login", { msgEmail })
  }
}

const userLogout = (req, res) => {
  req.session.destroy((err) => {
    res.redirect('/') // will always fire after session is destroyed
  })
}

const userProfile = async (req, res) => {
  const userId = req.session.user._id
  const userDetails = await userModel.findById({ _id: userId })
  res.render("user/user-profile", { userDetails })
}


const changePassword = async (req, res) => {

  const currentPassword = req.body.password
  let newPassword = req.body.newpassword
  const userId = req.session.user._id


  try {
    const userDetails = await userModel.findById({ _id: userId })

    const isPasswordValid = await bcrypt.compare(currentPassword, userDetails.password);
    if (isPasswordValid) {

      newPassword = await bcrypt.hash(newPassword, saltRounds)

      const updated = await userModel.updateOne({ _id: userId }, { $set: { password: newPassword } })
      if (updated) {
        msgNewPass = true

        res.render("user/user-profile", { msgNewPass, userDetails })
      } else {

        errNewPass = true
        res.render("user/user-profile", { errNewPass, userDetails })
      }
    } else {
      errMatchPass = true
      res.render("user/user-profile", { errMatchPass, userDetails })
    }

  } catch (error) {
    errOccurred = true
    res.render("user/user-profile", { errOccurred, userDetails })

  }



}

module.exports = {
  registerView,
  loginView,
  otpView,
  registerUser,
  loginUser,
  indexView,
  otpVerification,
  userLogout,
  userProfile,
  changePassword

};

