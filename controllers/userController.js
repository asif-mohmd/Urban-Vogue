const bcrypt = require("bcryptjs");
const saltRounds = 10;
const passport = require("passport");
const userModel = require("../models/User");
var session = require('express-session');
const ProductModel = require("../models/Product");


const verifyLogin = (req, res, next) => {
  // console.log(req.session.user)
  // if (req.session.user) {
    next()
  // } else {
  //   console.log(req.session.user)
  //   return res.redirect("/login")
  // }
}

const loginChecker = (req, res, next) => {
  // console.log(req.session.user)
  // if (req.session.user) {
  //   return res.redirect("/")
  // } else {
    next()
  // }
}

const indexView = async(req, res) => {
  const products = await ProductModel.find()
  
  console.log("lllllllllllll")
  res.render("user/index",{products});
}

const registerView = (req, res) => {
  res.render("user/register", {});
}

const registerUser = (req, res) => {
  const { name, email, mobile, gender, password, confirmPassword } = req.body;
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
        }

        data.password = await bcrypt.hash(data.password, saltRounds)

        const user = await userModel.create(data)
        if (user) {
          console.log("Successfuly registered")
          res.redirect("/login")
        } else {
          console.log("Registration failed")
          res.render("user/signup")
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
  console.log(email + " " + password);

  const user = await userModel.findOne({ email: email })
  console.log(user)
  if (user) {
    console.log('2')
    const data = await bcrypt.compare(password, user.password)

    if (data) {
      console.log('3')

      req.session.user = user
      console.log("logged")
      res.redirect("/")
    } else {
      console.log("not logged")
      res.render("user/login")
    }
  }

}

const productDetails =async (req,res) =>{

  console.log(req.query.id)
 console.log("qwertyuuio")

  const singleProduct = await ProductModel.findOne({_id:req.query.id})
  console.log(singleProduct,"1111111111111111")
  res.render("user/product-details",{singleProduct})
}





module.exports = {
  registerView,
  loginView,
  registerUser,
  loginUser,
  indexView,
  verifyLogin,
  loginChecker,
  productDetails
};

