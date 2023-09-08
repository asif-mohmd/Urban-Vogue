const bcrypt = require("bcryptjs");
const saltRounds = 10;
const passport = require("passport");
const userModel = require("../models/User");



const indexView = (req, res) => {
  res.render("user/index", {
   
  });
};

  

const registerView =  (req, res) => {
  res.render("user/register", {});
}

const registerUser =  (req, res) => {
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
          "name":name,
          "email":email, 
          "mobile":mobile, 
          "gender":gender, 
          "password":password,
        }

        data.password = await bcrypt.hash(data.password,saltRounds)

        const user = await userModel.create(data)
        if(user){
          console.log("Successfuly registered")
        }else{
          console.log("Registration failed")
        }

      }
    });
  }
};

const loginView = (req, res) => {
  res.render("user/login", {});
}

const loginUser = (req, res) => {
  const { email, password } = req.body;
  console.log(email + " " + password);

  if (!email || !password) {
    console.log("Please fill in all the fields");
    res.render("login", {
      email,
      password,
    });
  } else {

    const data = userModel.findOne({email:email})

    if(data){
       const user = bcrypt.compare({password:password})

    }

    
  }
};

module.exports = {
  registerView,
  loginView,
  registerUser,
  loginUser,
  indexView,
};

