const bcrypt = require("bcryptjs");
const saltRounds = 10;
const UserModel = require("../models/User");
var session = require('express-session');
const ProductModel = require("../models/Product");
const sendMail = require("../utils/nodeMailer");

const CartModel = require("../models/Cart");
const OrderModel = require("../models/Order");
const formatDate = require("../utils/dateGenerator");
const generateRandomOrder = require("../utils/orderIdGenerator")






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
  
  let total = await getTotalAmout(userId)

  total = total[0] ? total[0].total : 0;
    //  console.log(cartItems)
  res.render("user/cart", { cartItems, total }); // Pass the cartObject to the render function
};

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
      console.log(productExists, ">>>>>>11111111111111111<<<<<<<<<<<<<<")
      if (productExists) {

        await CartModel.updateOne({ userId: userId, 'cart.productId': productId }, { $inc: { 'cart.$.count': 1 } });
        res.redirect("/cart")

      } else {

        await CartModel.updateOne({ userId: userId }, { $push: { cart: { productId, count: 1 } } });
        res.redirect("/cart")
      }
      res.status(200).json({ message: 'Product added to cart successfully' });

    } else {
      cartData = {
        userId: userId,
        cart: [data]
      }
      const newCart = await CartModel.create(cartData)
      if (newCart) {
        console.log("new Cart success")
        res.redirect("/cart")
      } else {
        console.log("not successs")
      }

    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteCartItem = async (req, res) => {
  console.log("11111111111111111")
  const productId = req.query.id
  const userId = req.session.user._id;
  console.log(userId, ">>>>>>>>>>>>>>>>>>>>>", productId)

  try {
    const cart = await CartModel.updateOne({ userId: userId }, { $pull: { "cart": { productId: productId } } })
    console.log("22222222222222222222")
    if (cart) {
      console.log("deleted")
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
        console.log("stage 1");
        response = { removeProduct: true };
      } else {
        response = { removeProduct: false };
      }
    } else {
      const updated = await CartModel.updateOne({ _id: cart, 'cart.productId': product }, { $inc: { 'cart.$.count': count } });
      if (updated) {
        console.log("stage 2");
        const userId = req.session.user._id

        let total = await getTotalAmout(userId)
        console.log(total,"sueeeeee")
        response = { status: true ,total };
      } else {
        response = { status: false };
      }
    }

    res.json(response);  // Send the response back to the client
  } catch (error) {
    console.error('Error in changeProductQuantity:', error);
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
console.log(userId,"oooooooooooooo")

  res.render("user/checkout",{total})
}


const placeOrder = async (req, res) => {
  console.log(req.body, "orderrrrrrrrrrrrrr", userId)


  const randomOrderId = await generateRandomOrder();
  const currentDate = new Date();
  const formattedDate = formatDate(currentDate);
  let total = await getTotalAmout(userId)

 
  const data = {
    "userId" : userId,
    "orderId": randomOrderId,
    "zip": req.body.zip,
    "date": formattedDate,
    "amount": total[0].total,
    "status" : "pending"

  }

  const order = await OrderModel.create(data)
  if (order) {

    console.log("order created")
    const cart = await CartModel.updateOne({ userId: userId },{ $set: { cart: [] } } )
    console.log("22222222222222222222")
    if (cart) {
      console.log("cart updated")
      res.redirect("/")
    }
   
  } else {
    console.log("no orders")
  }


}

const ordersView = async(req,res)=>{
  const pendingOrders = await OrderModel.find({status:"pending"})
  res.render("user/orders",{pendingOrders})
}

const cancelUserOrder = async(req,res) =>{
  const orderId = req.query.id
  console.log(orderId,"yessssssssssssss",req.body)
  const success = await OrderModel.updateOne({_id:orderId},{$set:{status:"cancelled"}})
  if(success) {
      console.log("cancelled")
      res.redirect("/orders")
  }else{
    res.redirect("/orders")
      console.log("not cancelled")
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

