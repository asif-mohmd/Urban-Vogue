const bcrypt = require("bcryptjs");
const saltRounds = 10;
const UserModel = require("../models/User");
var session = require('express-session');
const ProductModel = require("../models/Product");
const sendMail = require("../utils/nodeMailer");

const CartModel = require("../models/Cart");
const OrderModel = require("../models/Order");
const formatDate = require("../utils/dateGenerator");
const generateRandomOrder = require("../utils/orderIdGenerator");
const { productDetails } = require("./productController");




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
  const { name, email, mobile, gender, address,country,password, confirmPassword } = req.body;
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
          "address": address,
          "shippingAddress":"",
          "country":"",
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






const cartView = async (req, res ) => {

  const userId = req.session.user._id;

   const cartItems = await getProducts(userId)

  let total = await getTotalAmout(userId)

  total = total[0] ? total[0].total : 0;

  res.render("user/cart", { cartItems, total }); // Pass the cartObject to the render function
  return cartItems;
};


const placeOrder = async (req, res) => {

  const randomOrderId = await generateRandomOrder();
  const currentDate = new Date();
  const formattedDate = formatDate(currentDate);
 
  const userId = req.session.user._id; // assuming user._id is stored in the session
  let total = await getTotalAmout(userId)

  const cartItems = await getProducts(userId)
  const userData = await UserModel.findOne({_id:userId})

 const userDetails = {
  "name": userData.name,
  "email": userData.email,
  "mobile": userData.mobile,
  "gender":userData.gender,
  "address": userData.address
 }

  const products = cartItems.map(cartItem => ({
    name: cartItem.product.name,
    price: cartItem.product.price,
    count: cartItem.count
  }));

  const data = {
    "userDetails" : userDetails,
    "orderId": randomOrderId,
    "zip": req.body.zip,
    "date": formattedDate,
     products: products,
    "amount": total[0].total,
    "status" : "pending"

  }
 
  const order = await OrderModel.create(data)
  if (order) {

    const cart = await CartModel.updateOne({ userId: userId },{ $set: { cart: [] } } )

    if (cart) {
      const pendingOrders = await OrderModel.findOne({orderId: order.orderId  })
      res.render("user/order-response",{pendingOrders})
    }
   
  } else {
    console.log("no orders")
  }


}



const addToCart = async (req, res) => {
  const productId = req.query.id;
  const userId = req.session.user._id;

  try {
    const data = {
      productId: productId,
      count: 1
    };

    const cart = await CartModel.findOne({ userId: userId });

    if (cart) {
      const productExists = cart.cart.some(item => item.productId === productId);

      if (productExists) {
        await CartModel.updateOne({ userId: userId, 'cart.productId': productId }, { $inc: { 'cart.$.count': 1 } });
      } else {
        await CartModel.updateOne({ userId: userId }, { $push: { cart: { productId, count: 1 } } });
      }

      res.redirect("/cart"); // Moved the redirect here
    } else {
      const cartData = {
        userId: userId,
        cart: [data]
      };

      const newCart = await CartModel.create(cartData);

      if (newCart) {
        res.redirect("/cart"); // Moved the redirect here
      } else {
        console.log("Creation of cart failed");
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};


const deleteCartItem = async (req, res) => {

  const productId = req.query.id
  const userId = req.session.user._id;

  try {
    const cart = await CartModel.updateOne({ userId: userId }, { $pull: { "cart": { productId: productId } } })
 
    if (cart) {
    
      res.redirect("/cart")
    }

  } catch (error) {
    console.log("Not deleted ")
  }


}

const changeProductQuantity = async (req, res) => {
  try {
    let { cart, product, count, quantity } = req.body;
    count = parseInt(count);
    quantity = parseInt(quantity);

    let response;

    if (count === -1 && quantity === 1) {
      const removeProduct = await CartModel.updateOne({ _id: cart }, { $pull: { "cart": { productId: product } } });
      if (removeProduct) {
       
        response = { removeProduct: true };
      } else {
        response = { removeProduct: false };
      }
    } else {
      const updated = await CartModel.updateOne({ _id: cart, 'cart.productId': product }, { $inc: { 'cart.$.count': count } });
      if (updated) {
       
        const userId = req.session.user._id

        let total = await getTotalAmout(userId)
 
        response = { status: true ,total };
      } else {
        response = { status: false };
      }
    }

    res.json(response);  // Send the response back to the client
  } catch (error) {
  
    res.status(500).json({ error: 'Internal Server Error' });
  }
    
};

const getTotalAmout = async (req,res)=>{

   userId = req
   
   const total = await CartModel.aggregate([
    {
      $match:{userId:userId}
    },
    {
      $unwind:'$cart'
    },{
      $project:{
        product: { $toObjectId: "$cart.productId" },
        count:'$cart.count',
        
      }
    },
    {
      $lookup:{
        from:'products',
        localField:"product",
        foreignField:"_id",
        as:"product"
      }
    },
    {
      $unwind:'$product'
    },
    {
      $project:{
        price: '$product.price',
          name: '$product.name',
          quantity:'$count'
      }
    },
      {             
        $group:{
            _id:null,     
            total:{$sum:{$multiply: ['$quantity', {$toInt: '$price'}]}}
        }
      },
        {
          $unwind:'$total'
        }
   ])
 return total
}


const proceedToCheckout = async (req,res) =>{
  
  let total = await getTotalAmout(userId)
  total = total[0] ? total[0].total : 0;


  res.render("user/checkout",{total})
}



const ordersView = async(req,res)=>{
  const userId = req.session.user._id
  
  const pendingOrders = await OrderModel.find({status:"pending"})
  
  res.render("user/orders",{pendingOrders})
}

const cancelUserOrder = async(req,res) =>{
  const orderId = req.query.id

  const success = await OrderModel.updateOne({_id:orderId},{$set:{status:"cancelled"}})
  if(success) {
  
      res.redirect("/orders")
  }else{
    res.redirect("/orders")

  }
}


const getProducts = async(userId) =>{
  const cartItems = await CartModel.aggregate([
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

  return cartItems
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
    changePassword,
    editProfile,
    addToCart,
    cartView,
    deleteCartItem,
    changeProductQuantity,
    proceedToCheckout,
    placeOrder,
    ordersView,
    cancelUserOrder

  };

