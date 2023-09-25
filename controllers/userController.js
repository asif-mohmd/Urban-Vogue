const bcrypt = require("bcryptjs");
const saltRounds = 10;
const UserModel = require("../models/User");
var session = require('express-session');
const ProductModel = require("../models/Product");
const sendMail = require("../utils/nodeMailer");
const userModel = require("../models/User");
const cartModel = require("../models/Cart")





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
    const user = await UserModel.create(data)
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
    UserModel.findOne({ email: email }).then(async (user) => {
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
  const user = await UserModel.findOne({ email: email })
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
  const userDetails = await UserModel.findById({ _id: userId })
  res.render("user/user-profile", { userDetails })
}


const changePassword = async (req, res) => {

  const currentPassword = req.body.password
  let newPassword = req.body.newpassword
  const userId = req.session.user._id


  try {
    const userDetails = await UserModel.findById({ _id: userId })

    const isPasswordValid = await bcrypt.compare(currentPassword, userDetails.password);
    if (isPasswordValid) {

      newPassword = await bcrypt.hash(newPassword, saltRounds)

      const updated = await UserModel.updateOne({ _id: userId }, { $set: { password: newPassword } })
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


const editProfile = async (req, res) => {
  const userId = req.session.user._id
  const { name, country, mobile, email, address, shippingAddress } = req.body
  const userDetails = await UserModel.findById({ _id: userId })
  try {
    const user = await UserModel.updateOne({ _id: userId },
      {
        $set: {
          name: name,
          email: email,
          mobile: mobile,
          country: country,
          address: address,
          shippingAddress: shippingAddress
        }
      })
    if (user) {
      msgProfile = true

      res.render("user/user-profile", { msgProfile, userDetails })
    } else {
      errOccurred = true
      res.render("user/user-profile", { errOccurred, userDetails })
    }

  } catch (err) {
    errOccurred = true
    res.render("user/user-profile", { errOccurred })
  }
}


const cartView = async (req, res) => {
  const userId = req.session.user._id;
  console.log("1111111111111>>>>>>>>>>>>>>>>>>>>>>>>")
  const cartItems = await cartModel.aggregate([
    {
      $match: { userId: userId }
    },
    {
      $unwind: '$cart'
    },
    {
      $project:
      {
        product: { $toObjectId: "$cart.productId" },
        count: "$cart.count"
      }
    },
    {
      $lookup:
      {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "product"
      }
    },
    {
      $unwind: '$product'
    }


  ])

 

  console.log(cartItems, "{{{{{{{{{{{{success}}}}}}}}}}}}}}}}");
  res.render("user/cart", { cartItems }); // Pass the cartObject to the render function
};
const addToCart = async (req, res) => {
  const productId = req.query.id;
  const userId = req.session.user._id;
  try {
    const data = {
      productId: productId,
      count: 1
    };
    const cart = await cartModel.findOne({userId:userId});

    if (cart) {
      const productExists = cart.cart.some(item => item.productId === productId);
      console.log(productExists,">>>>>>11111111111111111<<<<<<<<<<<<<<")
      if (productExists) {

        await cartModel.updateOne({ userId: userId, 'cart.productId': productId }, { $inc: { 'cart.$.count': 1 } });
        res.redirect("/cart")
        
      } else {

        await cartModel.updateOne({ userId: userId }, { $push: { cart: { productId, count: 1 } } });
        res.redirect("/cart")
      }
      res.status(200).json({ message: 'Product added to cart successfully' });

    } else {
      cartData = {
        userId : userId,
        cart : [data]
      }
      const newCart = await cartModel.create(cartData)
      if(newCart){
        console.log("new Cart success")
        res.redirect("/cart")
      }else{
        console.log("not successs")
      }
      
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Internal server error' });
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
  userLogout,
  userProfile,
  changePassword,
  editProfile,
  addToCart,
  cartView

};


// const addToCart = async (req, res) => {

//   const productId = req.query.id
//   const userId = req.session.user._id

//   console.log(productId, "0000000000000000000")

//   try {
//     const data = {
//       "productId": productId,
//       "count": 1
//     }

//     const updated = await userModel.updateOne({ _id: userId }, { $push: { cart: data } })
//     console.log(updated)
//     if (updated) {
//       const cartItems = await userModel.find({ _id: userId }).lean()

//       const cartData = await userModel.aggregate([
//         { $match: { _id: userId } }, { $unwind: "$cart" },
//         { $lookup: { from: "ProductModel", localField: "cart._id", foreignField: "_id", as: 'cart.details' } },
//         { $group: { _id: "$_id", cart: { $push: "$cart" } } }])
//       console.log("updated", cartItems[0], '------', cartData)
//       res.render("user/cart", { cartItems })
//     } else {
//       res.redirect("/product-details")
//     }
//   } catch (err) {
//     res.redirect("/product-details")
//   }
// }






// if (updated) {
//   const user = await userModel.findById(userId).lean();
//   const userCartProducts = user.cart;
//   const userCartProductIds = userCartProducts.map(item => item.productId);
//   console.log(userCartProductIds)
//   const cartDetails = await ProductModel.aggregate([
//     {
//       $unwind: "$cart"  // Unwind the cart array to access its elements
//     },
//     {
//       $match: {
//         "cart.productId": { $in: userCartProductIds }  // Match against nested productId
//       }
//     },
//     {
//       $project: {
//         name: 1,
//         price: 1,
//         cart: "$cart"  // Include the cart item for reference if needed
//         // Add other fields you want to include in the cart
//       }
//     }
//   ]);
// console.log(cartDetails,">>>><<<<<<<<<<<>>>>>>>><<<<<<<<<<<<")
//   res.render("user/cart", { cart: cartDetails });

// } else {
//   res.redirect("/product-details");
// }