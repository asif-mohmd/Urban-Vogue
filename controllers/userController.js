const bcrypt = require("bcryptjs");
const saltRounds = 10;
const UserModel = require("../models/User");
var session = require('express-session');
const ProductModel = require("../models/Product");
const sendMail = require("../utils/nodeMailer");
const path = require('path')
const CartModel = require("../models/Cart");
const OrderModel = require("../models/Order");
const formatDate = require("../utils/dateGenerator");
const generateRandomOrder = require("../utils/orderIdGenerator");
const { productDetails } = require("./productController");
const moment = require('moment'); // Import Moment.js
const Razorpay = require('razorpay');
const { response } = require("express");
const puppeteer = require("puppeteer")



var instance = new Razorpay({
  key_id: 'rzp_test_TtPOAmMOzmofnE',
  key_secret: 'X3yBumo4FEeZywGxjU5zFovG',
});




const indexView = async (req, res) => {

  const products = await ProductModel.find({ listStatus: true , deleteStatus:false})
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
  const { name, email, mobile, gender, address,officeAddress,country,password, confirmPassword } = req.body;
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
          "address": {homeAddress:address,officeAddress:officeAddress,customAddress:"NIL"},
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
  const { name, country, mobile, email, homeAddress, officeAddress } = req.body
  const userDetails = await UserModel.findById({ _id: userId })
  try {
    const user = await UserModel.updateOne({ _id: userId },
      {
        $set: {
          name: name,
          email: email,
          mobile: mobile,
          country: country,
          'address.homeAddress': homeAddress,
          'address.officeAddress': officeAddress
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
  const address = req.body.address === '3' ? req.body.customAddress : req.body.address;


  const userId = req.session.user._id; // assuming user._id is stored in the session
  let total = await getTotalAmout(userId)

  const cartItems = await getProducts(userId)
  let response;

  const products = cartItems.map(cartItem => ({
    productId: cartItem.product._id,
    name: cartItem.product.name,
    price: cartItem.product.price,
    count: cartItem.count,
    size: cartItem.size
    
  }));

console.log("call is here 1")
  const data = {
    "userId": userId,
    "orderId": randomOrderId,
    "address":address,
    "zip": req.body.zip,
    "date": formattedDate,
    products: products,
    "amount": total[0].total,
    "paymentMethod":"COD",
    "status": "pending"

  }


console.log("data:",data)

  const order = await OrderModel.create(data)
  if (order) {
console.log("222")
    if (req.body.paymentMethod == 'Online') {

      const order = await generateRazorpay(randomOrderId, total)
      response = { status: true, order }
    
      res.json(response);
  

    } else {
      for (const product of products) {
        const existingProduct = await ProductModel.findById(product.productId);

        if (existingProduct && existingProduct.stock >= product.count) {
          await ProductModel.updateOne(
            { _id: product.productId, stock: { $gte: product.count } },
            { $inc: { stock: -product.count } }
          );
        } else {
          console.log(`Insufficient stock for product with ID ${product.productId}`);
          // Handle insufficient stock scenario here, e.g., notify the user
        }
      }

      const cart = await CartModel.updateOne({ userId: userId }, { $set: { cart: [] } })
      if (cart) {

        const pendingOrders = await OrderModel.findOne({ orderId: order.orderId })
        response = { status: true, pendingOrders }
        // res.render("user/order-response",{pendingOrders})
        res.json(response);
      }

    }



  } else {
    console.log("no orders")
    
  }


}


const generateRazorpay = async (randomOrderId, total) => {
  try {
    const order = await instance.orders.create({
      amount: total[0].total,
      currency: "INR",
      receipt: randomOrderId,
      notes: {
        key1: "value3",
        key2: "value2"
      }
    });

    if (order) {
      
   
      return order
    } else {
      console.log("not success online");
    }
  } catch (error) {
    console.error("Error creating order:", error);
  }
};



const verifyPayment = async (req, res) => {
  console.log('Inside verifyPayment function');
  console.log(req.body, 'verify payment razor completed');
  const verificationSuccess = await paymentVerifiaction(req.body)
   let response;
  if(verificationSuccess){
 
    console.log(req.body['order[receipt]'],"xxxxxxxxxxxxxxxx"); // This should log '1696866506'

      const success = await changePaymentStatus(req.body['order[receipt]'])
      if(success){
        console.log("success555555555")
        const onlineDetails = await OrderModel.findOne({orderId:req.body['order[receipt]']})
        console.log(onlineDetails,"----------------------------")
        response = { status: true, onlineDetails}
        res.json(response)
      }else{
        console.log("status update failed")
      }

    }
  }


const paymentVerifiaction = (details) => {

  const crypto = require('crypto')
  let hmac = crypto.createHmac("sha256", "X3yBumo4FEeZywGxjU5zFovG")

  hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
  hmac = hmac.digest('hex')
  if (hmac == details['payment[razorpay_signature]']) {
    return true
  } else {
    return false
  }
}

const changePaymentStatus = async(orderId)=>{
  console.log(orderId,"orderId")
  const updatedDetails = await OrderModel.updateOne({orderId:orderId},{$set:{paymentMethod:"placed"}})
 console.log(updatedDetails,"updatedDeatils")
  if(updatedDetails){
    console.log("status updated",)
    return true
  }else{
    return false
  }

}












const addToCart = async (req, res) => {
  const productId = req.query.id;
  const userId = req.session.user._id;
  const size = req.query.size

  console.log("eeeeeeeee",req.query.size,"sizeeeeeeeeeeeeeeeeeeeeeeee")

  try {
    const data = {
      productId: productId,
      count: 1,
      size: size
    };
console.log(data,"::::::::::::::::::::::::")
    const cart = await CartModel.findOne({ userId: userId });

    if (cart) {
      const productExists = cart.cart.some(item => item.productId === productId);

      if (productExists) {
        await CartModel.updateOne({ userId: userId, 'cart.productId': productId }, { $inc: { 'cart.$.count': 1 } }, {$set:{size:size}});
      } else {
        await CartModel.updateOne({ userId: userId }, { $push: { cart: { productId, count: 1 , size} } });
      }

      res.redirect("/cart"); // Moved the redirect here
    } else {
      const cartData = {
        userId: userId,
        cart: [data]
      };

      const newCart = await CartModel.create(cartData);
console.log(newCart,"qqqqqqqqqqqqqqqqqqqqqq")
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

      const productDetails = await ProductModel.findOne({ _id: product })


      if (productDetails.stock >= quantity + count) {
        const updated = await CartModel.updateOne({ _id: cart, 'cart.productId': product }, { $inc: { 'cart.$.count': count } });
        if (updated) {

          const userId = req.session.user._id

          let total = await getTotalAmout(userId)

          response = { status: true, total };
        } else {
          response = { status: false };
        }
      } else {
        response = { stockLimit: true }
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
  
  const userId = req.session.user._id

  const userDetails = await UserModel.findById({_id:userId})

  let total = await getTotalAmout(userId)
  total = total[0] ? total[0].total : 0;

  res.render("user/checkout",{total,userDetails})
}



const ordersView = async(req,res)=>{

  
  const pendingOrders = await OrderModel.find();

  
  

  res.render("user/orders",{pendingOrders})
}




const cancelUserOrder = async(req,res) =>{
  const orderId = req.query.id


  const orderDetails = await OrderModel.findById({ _id: orderId })


  const productDetails = orderDetails.products.map(product => ({
    productId: product.productId,
    count: product.count
  }));

  for (const product of productDetails) {
    const existingProduct = await ProductModel.findById(product.productId);

    if (existingProduct && existingProduct.stock >= product.count) {
      await ProductModel.updateOne(
        { _id: product.productId }, { $inc: { stock: product.count } }
      );
    } else {
      console.log(`Insufficient stock for product with ID ${product.productId}`);
      // Handle insufficient stock scenario here, e.g., notify the user
    }

  }
  const success = await OrderModel.updateOne({_id:orderId},{$set:{status:"cancelled"}})
  if (success) {
    console.log("cancelled")
    res.redirect("/orders")
  } else {
    console.log("not cancelled")
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
        count: "$cart.count",
        size: "$cart.size"
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


const orderDetailView = async (req, res) => {
  const orderObjId = req.query.id;

  try {
    const orderDetails = await OrderModel.findById({ _id: orderObjId });

    if (!orderDetails) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const today = new Date();
    const formattedDeliveryDate = moment(orderDetails.date, 'DD/MM/YYYY').format('YYYY-MM-DD');

    const deliveryDate = new Date(formattedDeliveryDate);
    
    if (isNaN(deliveryDate.getTime())) {
      return res.status(400).json({ message: 'Invalid delivery date' });
    }


    // Calculate the difference in days
    const daysDifference = Math.floor((today - deliveryDate) / (1000 * 60 * 60 * 24)) + 1;

    let orderReturn = false;
    if (daysDifference <= 7) {
      orderReturn = true;
    }

    console.log(orderDetails,"------------------------------")
    res.render('user/order-detail-view', { orderDetails, orderReturn });

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};



const returnUserOrder = async (req, res) => {
console.log("gehehehehehee")
  try {
    const orderObjId = req.query.orderId
    const returnType = req.query.returnType
    const userId = req.session.user._id
console.log(orderObjId,"................",returnType)
    if (returnType == 1) {

      const orderDetails = await OrderModel.findById({ _id: orderObjId })


      const productDetails = orderDetails.products.map(product => ({
        productId: product.productId,
        count: product.count
      }));

      for (const product of productDetails) {
        const existingProduct = await ProductModel.findById(product.productId);

        if (existingProduct && existingProduct.stock >= product.count) {
          await ProductModel.updateOne(
            { _id: product.productId }, { $inc: { stock: product.count } }
          );
        } else {
          console.log(`Insufficient stock for product with ID ${product.productId}`);
          // Handle insufficient stock scenario here, e.g., notify the user
        }

      }
      const returnNonDefective = await OrderModel.updateOne({ _id: orderObjId }, { status: "returnNonDefective" })

      if (returnNonDefective) {
        returnSuccess = true
        res.render("user/orders")
      } else {
        returnErr = true
        res.render("user/orders", { returnErr })
      }

    } else {
      const returnDefective = await OrderModel.updateOne({ _id: orderObjId }, { status: "returnDefective" })
      if (returnDefective) {
        returnSuccess = true
        res.render("user/orders", { returnSuccess })
      } else {
        returnErr = true
        res.render("user/orders", { returnErr })
      }

    }
  } catch (error) {

    res.status(500).json({ error: 'Internal Server Error' });
  }


}

const contactView = (req,res)=>{
  res.render("user/contact")
}

const orderResponseView = (req,res) =>{
  res.render("user/order-response")
}


const loadReport = async(req,res) =>{

  const recentOrders = await OrderModel.find({status:'delivered'})
  
  res.render("admin/sales-report",{recentOrders})
}


const generateReport = async (req,res) =>{
  console.log("yeyey")

  try{

    const browser = await puppeteer.launch({
      headless: false //
    });
    const page = await browser.newPage();

    await page.goto(`${req.protocol}://${req.get("host")}`+"/report",{
      waitUntil:"networkidle2"
    })

    await page.setViewport({width:1680, height: 1050})
    
    const todayDate = new Date()

    const pdfn =  await page.pdf({
      path:`${path.join(__dirname,"../public/files", todayDate.getTime()+".pdf")}`,
      printBackground:true,
      format:"A4"
    })

    if(browser) await browser.close()

    const pdfURL = path.join(__dirname,"../public/files", todayDate.getTime()+".pdf")

    // res.set({
    //   "Content-Type":"application/pdf",
    //   "Content-Length":pdfn.length
    // })
    // res.sendFile(pdfURL)

    res.download(pdfURL,function(err){
      if(err){
        console.log(err)
      }

    })

  }catch(error){
    console.log(error.message)
  }
}


const invoiceView = async (req,res) =>{

  // console.log(req.query.id,"qqqqqqqqqqqqqqqqqqqqqqqqqqq")
  const orderObjId = "652958617c4a2784a57ea3c1"

  let userOrders = await OrderModel.find({_id:orderObjId}) 

  userOrders = userOrders[0]





  console.log(userOrders,"iiiiiiiiiiiiiiiiiiiiiiii")
  console.log(userOrders.products,"ppppppppppppppppppp")

  const productDetails = userOrders.products
  console.log(productDetails,";;;;;;;;;;;;;;;;;;;;")


  res.render("user/invoice",{userOrders,productDetails})
}




const invoiceReport = async(req,res) =>{

  const orderObjId = req.query.id
  console.log(orderObjId,"kkkkkkkkkkkkkkk")


  try{

    const browser = await puppeteer.launch({
      headless: false //
    });
    const page = await browser.newPage();

    await page.goto(`${req.protocol}://${req.get("host")}/invoice?id=${orderObjId}`, {
      waitUntil: "networkidle2"
    });

    await page.setViewport({width:1680, height: 1050})
    
    const todayDate = new Date()

    const pdfn =  await page.pdf({
      path:`${path.join(__dirname,"../public/files", todayDate.getTime()+".pdf")}`,
      printBackground:true,
      format:"A4"
    })

    if(browser) await browser.close()

    const pdfURL = path.join(__dirname,"../public/files", todayDate.getTime()+".pdf")

    // res.set({
    //   "Content-Type":"application/pdf",
    //   "Content-Length":pdfn.length
    // })
    // res.sendFile(pdfURL)

    res.download(pdfURL,function(err){
      if(err){
        console.log(err)
      }

    })

  }catch(error){
    console.log(error.message)
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
    cancelUserOrder,
    returnUserOrder,
    orderDetailView,
    contactView,
    orderResponseView,
    verifyPayment,
    loadReport,
    generateReport,
    invoiceView,
    invoiceReport

  };



  
// const wishlistView = async(req,res) =>{
  
//   const wishlistProducts = await ProductModel.find({wishlist:true})
//   if(wishlistProducts){
//     console.log(wishlistProducts,"=============")
//     res.render("user/wishlist",{wishlistProducts})
//   }else{
//     noWishist = true
//     res.render("/",{noWishist})
//   }
// }

// const addToWishlist = async(req,res) =>{

//   const wishlisted = await ProductModel.updateOne({_id:req.query.id},{wishlist:true})
//   const wishlistProducts = await ProductModel.find({wishlist:true})

//   console.log(wishlistProducts,"addtowishhhhhhhhhhhhhhhhhhh")

//   if(wishlisted){
//     res.render("user/wishlist",{wishlistProducts})  
//     }else{
//       noWishist = true
//       res.render("/",{noWishist})
//     }
//   }

//   const removeWishlistProduct = async(req,res) =>{

//     const wishlistRemoved = await ProductModel.updateOne({_id:req.query.id},{wishlist:false})
//     const wishlistProducts = await ProductModel.find({wishlist:true})
  
//     console.log(wishlistProducts,"addtowishhhhhhhhhhhhhhhhhhh")
  
//     if(wishlistRemoved){
//       res.render("user/wishlist",{wishlistProducts})  
//       }else{
//         noWishist = true
//     res.render("/",{noWishist})
//       }
//     }
