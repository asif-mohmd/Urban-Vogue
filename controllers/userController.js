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
const AddressModel = require("../models/Address")
const { ObjectId } = require('mongodb');
const CouponModel = require("../models/Coupon")


var instance = new Razorpay({
  key_id: 'rzp_test_TtPOAmMOzmofnE',
  key_secret: 'X3yBumo4FEeZywGxjU5zFovG',
});

const errorHandler = async (req,res)=>{
  res.status(404).render("user/error-handling");
}

const indexView = async (req, res) => {

  try {
    const products = await ProductModel.find({ listStatus: true, deleteStatus: false }).limit(8)
    res.render("user/index", { products });
  } catch (err) {
    res.status(404).render("user/error-handling");
  }
}


const registerView = (req, res) => {

  try {
    res.render("user/register", {});
  } catch (err) {
    res.status(404).render("user/error-handling");
  }
}


const otpView = (req, res) => {

  try {
    res.render("user/otp")
  } catch (err) {
    res.status(404).render("user/error-handling");
  }
}

const otpVerification = async (req, res) => {

  try {
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
  } catch (err) {
    res.status(404).render("user/error-handling");
  }
}


const registerUser = async (req, res) => {

  try {
    const { name, email, mobile, address, city, state, pincode, password, confirmPassword } = req.body;
    await sendMail(email)

    UserModel.findOne({ email: email }).then(async (user) => {
      if (user) {
        let emailExists = true
        res.render("user/register", { emailExists })
      } else {
        data = {
          "name": name,
          "email": email,
          "mobile": mobile,
          "address": address,
          "state": state,
          "city": city,
          "pincode": pincode,
          "password": password,
          "wallet": 0,
          "status": true,
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

  } catch (err) {
    res.status(404).render("user/error-handling");
  }
};


const addNewAddressUser = async (req, res) => {

  try {
    const userIdd = req.session.user._id

    let details = req.body
    const updateAddress = await newAddressManagement(details, userId)

    if (updateAddress) {
      const newAddress = await AddressModel.findOne({ userId: userId })
      const userDetails = await UserModel.findById({ _id: userId })
      msgAddressNew = true
      res.render("user/user-profile", { msgAddressNew, userDetails, newAddress })
    } else {
      const newAddress = await AddressModel.findOne({ userId: userId })
      const userDetails = await UserModel.findById({ _id: userId })
      errOccurred = true
      res.render("user/user-profile", { errOccurred, userDetails, newAddress })
    }
  } catch (err) {
    res.status(404).render("user/error-handling");
  }
}


const addNewAddressCheckout = async (req, res) => {

  try {
    const userId = req.session.user._id
    let details = req.body
    const updateAddress = await newAddressManagement(details, userId)
    if (updateAddress) {
      res.redirect("/checkout")
    }
  } catch (err) {
    res.status(404).render("user/error-handling");
  }
}


const newAddressManagement = async (details, userId) => {

  try {
    const { name, email, mobile, address, city, state, pincode } = details;
    const newAddress = {
      name: name,
      email: email,
      mobile: mobile,
      address: address,
      city: city,
      state: state,
      pincode: pincode
    }

    const addressExists = await AddressModel.findOne({ userId: userId })
    if (addressExists) {

      const updateAddress = await AddressModel.updateOne({ userId: userId }, { $push: { address: newAddress } })

      if (updateAddress) {

        return true
      }

    } else {

      data = {
        userId: userId,
        address: [newAddress]
      }

      const updateAddress = await AddressModel.create(data)

      if (updateAddress) {
        return true
      } else {
        return false
      }
    }
  } catch (err) {
    res.status(404).render("user/error-handling");
  }
}


const removeNewAddressUser = async (req, res) => {

  try {
    const addressId = req.query.id
    const userId = req.session.user._id

    const addressRemoved = await AddressModel.updateOne({ userId: userId }, { $pull: { address: { _id: addressId } } })

    if (addressRemoved) {
      const userDetails = await UserModel.findById({ _id: userId })
      const newAddress = await AddressModel.findOne({ userId: userId })
      let msgAddressRemove = true
      res.render("user/user-profile", { msgAddressRemove, userDetails, newAddress })
    } else {
      const userDetails = await UserModel.findById({ _id: userId })
      const newAddress = await AddressModel.findOne({ userId: userId })
      errOccurred = true
      res.render("user/user-profile", { errOccurred, userDetails, newAddress })
    }

  } catch (err) {
    res.status(404).render("user/error-handling");
  }
}



const removeNewAddressCheckout = async (req, res) => {

  try {
    const addressId = req.query.id
    const userId = req.session.user._id

    const addressRemoved = await AddressModel.updateOne({ userId: userId }, { $pull: { address: { _id: addressId } } })

    if (addressRemoved) {
      res.redirect("/checkout")
    } else {
      res.redirect("/checkout")
    }
  } catch (err) {
    res.status(404).render("user/error-handling");
  }
}



const loginView = (req, res) => {
  
  try {
    res.render("user/login", {});
  } catch (err) {
    res.status(404).render("user/error-handling");
  }
}


const loginUser = async (req, res) => {

  try {
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
  } catch (err) {
    res.status(404).render("user/error-handling");
  }
}

const userLogout = (req, res) => {

  try {
    req.session.destroy((err) => {
      res.redirect('/') // will always fire after session is destroyed
    })
  } catch (err) {
    res.status(404).render("user/error-handling");
  }
}

const userProfile = async (req, res) => {

  try {
    const userId = req.session.user._id
    const userDetails = await UserModel.findById({ _id: userId })
    const newAddress = await AddressModel.findOne({ userId: userId })
    res.render("user/user-profile", { userDetails, newAddress })
  } catch (err) {
    res.status(404).render("user/error-handling");
  }

}


const changePassword = async (req, res) => {

  try {
    const currentPassword = req.body.password
    let newPassword = req.body.newpassword
    const userId = req.session.user._id
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

  try {
    const userId = req.session.user._id
    const { name, mobile, email, address, state, city, pincode } = req.body
    const userDetails = await UserModel.findById({ _id: userId })
    const user = await UserModel.updateOne({ _id: userId },
      {
        $set: {
          name: name,
          email: email,
          mobile: mobile,
          address: address,
          state: state,
          city: city,
          pincode: pincode

        }
      })
    if (user) {
      msgProfile = true
      const userDetails = await UserModel.findById({ _id: userId })
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

  try {
    const stockLimit = req.query.stockLimit;
    const userId = req.session.user._id;
    const cartItems = await getProducts(userId)

    let total = await getTotalAmout(userId)

    total = total[0] ? total[0].total : 0;

    res.render("user/cart", { cartItems, total, stockLimit }); // Pass the cartObject to the render function
    // return cartItems;

  } catch (err) {
    res.status(404).render("user/error-handling");
  }


};

const placeOrder = async (req, res) => {
  try {
    let response;
    const selectedAddressId = new ObjectId(req.body.selectedAddressId);
    const couponCode = req.body.couponCode
    const randomOrderId = generateRandomOrder();
    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);
    const userId = req.session.user._id;
    const finalAmount = req.body.finalAmount
    let userAddress = await AddressModel.findOne({ userId: userId });
    userAddress = userAddress.address
    const address = userAddress.find((address) => address._id.equals(selectedAddressId));
    const cartItems = await getProducts(userId)

    const products = cartItems.map(cartItem => ({
      productId: cartItem.product._id,
      name: cartItem.product.name,
      price: cartItem.product.price,
      count: cartItem.count,
      size: cartItem.size

    }));
    const data = {
      "userId": userId,
      "orderId": randomOrderId,
      "address": address,
      "date": formattedDate,
      products: products,
      "amount": finalAmount,
      "couponCode": couponCode,
      "paymentMethod": "COD",
      "status": "pending"

    }

    const order = await OrderModel.create(data)
    if (order) {

      if (req.body.paymentMethod == 'Wallet') {

        let stockUpdate = stockQuantityUpdate()

        if (stockUpdate) {

          await UserModel.updateOne({ _id: userId }, { $inc: { wallet: -finalAmount } })

          const pendingOrders = await OrderModel.findOne({ orderId: order.orderId })
          const updatedDetails = await OrderModel.updateOne({ orderId: order.orderId }, { $set: { paymentMethod: "Wallet" } })

          if (updatedDetails) {
            response = { status: true, pendingOrders }
            res.json(response);
          } else {
            response = { status: false }
            res.json(response);
          }
        }
      }

      else if (req.body.paymentMethod == 'Online') {

        const order = await generateRazorpay(randomOrderId, finalAmount)

        response = { status: true, order }
        res.json(response);

      } else {
        let stockUpdate = stockQuantityUpdate()

        if (stockUpdate) {

          const pendingOrders = await OrderModel.findOne({ orderId: order.orderId })

          response = { status: true, pendingOrders }
          // res.render("user/order-response",{pendingOrders})
          res.json(response);
        }

      }
    } else {
      res.status(404).render("user/error-handling");
    }
  } catch (err) {
    res.status(404).render("user/error-handling");
  }
}


async function stockQuantityUpdate() {
  try {
    const cartItems = await getProducts(userId);
    const products = cartItems.map(cartItem => ({
      productId: cartItem.product._id, // Assuming productId is a reference to the product's ID
      count: cartItem.count,
      size: cartItem.size
    }));
    for (const product of products) {
      const existingProduct = await ProductModel.findById(product.productId);
      if (existingProduct) {
        // Check if the requested size is available in the existing product
        const requestedSize = product.size;

        if (existingProduct.sizeStock[requestedSize] && existingProduct.sizeStock[requestedSize].stock >= product.count) {
          // Update the stock for the requested size
          const updatedStock = existingProduct.sizeStock[requestedSize].stock - product.count;

          // Update the product's sizeStock field
          existingProduct.sizeStock[requestedSize].stock = updatedStock;

          // Save the updated product
          await existingProduct.save();
        } else {
          return false;
          // Handle insufficient stock scenario here, e.g., notify the user
        }
      } else {
        return false;
        // Handle product not found scenario here
      }
    }
    const cart = await CartModel.updateOne({ userId: userId }, { $set: { cart: [] } })

    if (cart) {
      return true
    } else {
      return false
    }


  } catch (err) {
    res.status(404).render("user/error-handling");
  }
}


const generateRazorpay = async (randomOrderId, finalAmount) => {

  try {
    const order = await instance.orders.create({
      amount: finalAmount * 100,
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
      res.status(404).render("user/error-handling");
    }
  } catch (error) {
    res.status(404).render("user/error-handling");
  }
};

const verifyPayment = async (req, res) => {

  try {

    const verificationSuccess = await paymentVerifiaction(req.body)
    let response;
    if (verificationSuccess) {

      const success = await changePaymentStatus(req.body['order[receipt]'])
      if (success) {
        const onlineDetails = await OrderModel.findOne({ orderId: req.body['order[receipt]'] })
        let stockUpdate = await stockQuantityUpdate()
        if (stockUpdate) {
          response = { status: true, onlineDetails }
          res.json(response)
        }
      } else {
        res.status(404).render("user/error-handling");
      }
    }
  } catch (err) {
    res.status(404).render("user/error-handling");
  }
}

const paymentVerifiaction = (details) => {

  try {
    const crypto = require('crypto')
    let hmac = crypto.createHmac("sha256", "X3yBumo4FEeZywGxjU5zFovG")

    hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
    hmac = hmac.digest('hex')
    if (hmac == details['payment[razorpay_signature]']) {
      return true
    } else {
      return false
    }
  } catch (err) {
    res.status(404).render("user/error-handling");
  } 
}

const changePaymentStatus = async (orderId) => {
 
  try {
    const updatedDetails = await OrderModel.updateOne({ orderId: orderId }, { $set: { paymentMethod: "Online" } })
    if (updatedDetails) {
      return true
    } else {
      return false
    }
  } catch (err) {
    res.status(404).render("user/error-handling");
  }
}

const addToCart = async (req, res) => {
  try {
    const productId = req.query.id;
    const userId = req.session.user._id;
    const size = req.query.size
    const data = {
      productId: productId,
      count: 1,
      size: size
    };



    const cart = await CartModel.findOne({ userId: userId });
    if (cart) {
      const productExists = cart.cart.some(item => item.productId === productId && item.size === size);

      if (productExists) {
        const productDetails = await ProductModel.findOne({ _id: productId });

        // You should define 'count' before using it
        let count = 0;

        for (const item of cart.cart) { // Changed 'cart' to 'cart.cart'
          if (
            item.productId === productId 
            && item.size === size
          ) {
            count = item.count;
            break; // Break the loop once the match is found
          }
        }


        if (productDetails.sizeStock[size].stock > count) {
          await CartModel.updateOne(
            { userId: userId, 'cart.productId': productId, 'cart.size': size },
            {
              $inc: { 'cart.$.count': 1 },
            }
          );

          res.redirect("/cart");
        } else {
          let stockLimit = true
          res.redirect(`/cart?stockLimit=${stockLimit}`);
        }
      } else {
        await CartModel.updateOne({ userId: userId }, { $push: { cart: { productId, count: 1, size } } });
        res.redirect("/cart"); // Moved the redirect here 

      }

    } else {
      const cartData = {
        userId: userId,
        cart: [data]
      };

      const newCart = await CartModel.create(cartData);
      if (newCart) {
        res.redirect("/cart"); // Moved the redirect here
      } else {
        res.status(404).render("user/error-handling");
      }
    }
  } catch (error) {
    res.status(404).json({ message: 'Internal server error' });
  }
};

const deleteCartItem = async (req, res) => {

  try {
    const productId = req.query.id
    const size = req.query.size
    const userId = req.session.user._id;
    const cart = await CartModel.updateOne({ userId: userId }, { $pull: { "cart": { productId: productId, size: size } } })

    if (cart) {
      res.redirect("/cart")
    }
  } catch (error) {
    res.status(404).json({ status: false, error: 'Something went wrong on the server.' });
  }
}

const changeProductQuantity = async (req, res) => {

  try {
    let { cart, product, size, count, quantity } = req.body;
    count = parseInt(count);
    quantity = parseInt(quantity);
    const requestedSize = size;
    let response;

    if (count === -1 && quantity === 1) {
      response = { removeProduct: true };
      const removeProduct = await CartModel.updateOne({ _id: cart }, { $pull: { "cart": { productId: product, size: size } } });
      if (removeProduct) {


      } else {
        response = { removeProduct: false };
      }
    } else {

      const productDetails = await ProductModel.findOne({ _id: product })



      if (productDetails.sizeStock[requestedSize].stock >= quantity + count) {
        const updated = await CartModel.updateOne({ _id: cart, 'cart.productId': product, 'cart.size': requestedSize }, { $inc: { 'cart.$.count': count } });
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

    res.status(404).json({ error: 'Internal Server Error' });
  }
};

const getTotalAmout = async (req, res) => {

  try {
    userId = req

    const total = await CartModel.aggregate([
      {
        $match: { userId: userId }
      },
      {
        $unwind: '$cart'
      }, {
        $project: {
          product: { $toObjectId: "$cart.productId" },
          count: '$cart.count',

        }
      },
      {
        $lookup: {
          from: 'products',
          localField: "product",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          price: '$product.price',
          name: '$product.name',
          quantity: '$count'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ['$quantity', { $toInt: '$price' }] } }
        }
      },
      {
        $unwind: '$total'
      }
    ])
    return total
  } catch (err) {
    res.status(404).render("user/error-handling");
  }
}


const proceedToCheckout = async (req, res) => {

  try {
    const userId = req.session.user._id

    const userDetails = await UserModel.findById({ _id: userId })
    const newAddress = await AddressModel.findOne({ userId: userId })

    let total = await getTotalAmout(userId)
    total = total[0] ? total[0].total : 0;

    res.render("user/checkout", { total, userDetails, newAddress })
  } catch (err) {
    res.status(404).render("user/error-handling");
  }
}



const ordersView = async (req, res) => {

  try {
    const pendingOrders = await OrderModel.find().sort({ $natural: -1 })
    res.render("user/orders", { pendingOrders })

  } catch (err) {
    res.status(404).render("user/error-handling");
  }
}


const cancelUserOrder = async (req, res) => {
  try {
    const orderId = req.query.id;
    const orderDetails = await OrderModel.findById({ _id: orderId });

    for (const product of orderDetails.products) {
      const productDetails = await ProductModel.findById(product.productId);

      if (productDetails && productDetails.sizeStock[product.size].stock >= product.count) {
        // Increase the stock count for the specific size in the product model
        const updatedStock = productDetails.sizeStock[product.size].stock + product.count;
        productDetails.sizeStock[product.size].stock = updatedStock;

        // Save the updated product model
        await productDetails.save();
      } else {
        res.status(404).render("user/error-handling");
        // Handle insufficient stock scenario here, e.g., notify the user
      }
    }

    // Update the order status to "cancelled"
    const success = await OrderModel.updateOne({ _id: orderId }, { $set: { status: "cancelled" } });

    if (success) {
      res.redirect("/orders");
    } else {
      res.redirect("/orders");
    }
  } catch (err) {
    res.status(404).render("user/error-handling");
  }
};



const getProducts = async (userId) => {

  try {
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
  } catch (err) {
    res.status(404).render("user/error-handling");
  }
}


const orderDetailView = async (req, res) => {

  try {
    const orderObjId = req.query.id;
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

    res.render('user/order-detail-view', { orderDetails, orderReturn });

  } catch (error) {
    return res.status(404).json({ error: 'Internal server error' });
  }
};



const returnUserOrder = async (req, res) => {
  try {
    const orderObjId = req.query.orderId;
    const returnType = req.query.returnType;
    const userId = req.session.user._id;

    if (returnType === '1') {
      const orderDetails = await OrderModel.findById({ _id: orderObjId });

      for (const product of orderDetails.products) {
        const productDetails = await ProductModel.findById(product.productId);

        if (productDetails && productDetails.sizeStock[product.size].stock >= product.count) {
          // Increase the stock count for the specific size in the product model
          const updatedStock = productDetails.sizeStock[product.size].stock + product.count;
          productDetails.sizeStock[product.size].stock = updatedStock;

          // Save the updated product model
          await productDetails.save();
        } else {
          res.status(404).render("user/error-handling");
          // Handle insufficient stock scenario here, e.g., notify the user
        }
      }

      const returnNonDefective = await OrderModel.updateOne({ _id: orderObjId }, { $set: { status: "returnNonDefective" } });

      if (returnNonDefective) {
        res.render("user/orders", { returnSuccess: true });
      } else {
        res.render("user/orders", { returnErr: true });
      }
    } else {
      const returnDefective = await OrderModel.updateOne({ _id: orderObjId }, { $set: { status: "returnDefective" } });

      if (returnDefective) {
        res.render("user/orders", { returnSuccess: true });
      } else {
        res.render("user/orders", { returnErr: true });
      }
    }
  } catch (error) {
    res.status(404).json({ error: 'Internal Server Error' });
  }
};


const contactView = (req, res) => {

  try {
    res.render("user/contact")
  } catch (err) {
    res.status(404).render("user/error-handling");
  }

}

const orderResponseView = (req, res) => {

  try {
    res.render("user/order-response")
  } catch (err) {
    res.status(404).render("user/error-handling");
  }

}


const loadReport = async (req, res) => {

  try {
    const recentOrders = await OrderModel.find({ status: 'delivered' })
    res.render("admin/sales-report", { recentOrders })
  } catch (err) {
    res.status(404).render("user/error-handling");
  }

}


const generateReport = async (req, res) => {

  try {
    const browser = await puppeteer.launch({
      headless: false //
    });
    const page = await browser.newPage();
    await page.goto(`${req.protocol}://${req.get("host")}` + "/report", {
      waitUntil: "networkidle2"
    })
    await page.setViewport({ width: 1680, height: 1050 })
    const todayDate = new Date()
    const pdfn = await page.pdf({
      path: `${path.join(__dirname, "../public/files", todayDate.getTime() + ".pdf")}`,
      printBackground: true,
      format: "A4"
    })
    if (browser) await browser.close()
    const pdfURL = path.join(__dirname, "../public/files", todayDate.getTime() + ".pdf")
    res.download(pdfURL, function (err) {
      if (err) {
        res.status(404).render("user/error-handling");
      }
    })
  } catch (error) {
    res.status(404).json({ status: false, error: 'Something went wrong on the server.' });
  }
}

const invoiceView = async (req, res) => {

  try {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = today.getFullYear();
    const formattedDate = `${day} ${month} ${year}`;
    const orderObjId = req.query.id

    let userOrders = await OrderModel.find({ _id: orderObjId })

    userOrders = userOrders[0]

    const userDetails = await UserModel.findById({ _id: userOrders.userId })

    const productDetails = userOrders.products

    res.render("user/invoice", { userOrders, productDetails, formattedDate, userDetails })
  } catch (err) {
    res.status(404).render("user/error-handling");
  }
}

const invoiceReport = async (req, res) => {

  try {
    const orderObjId = req.query.id
    const browser = await puppeteer.launch({
      headless: false //
    });
    const page = await browser.newPage();

    await page.goto(`${req.protocol}://${req.get("host")}/invoice?id=${orderObjId}`, {
      waitUntil: "networkidle2"
    });

    await page.setViewport({ width: 1680, height: 1050 })

    const todayDate = new Date()

    const pdfn = await page.pdf({
      path: `${path.join(__dirname, "../public/files", todayDate.getTime() + ".pdf")}`,
      printBackground: true,
      format: "A4"
    })

    if (browser) await browser.close()

    const pdfURL = path.join(__dirname, "../public/files", todayDate.getTime() + ".pdf")
    res.download(pdfURL, function (err) {
      if (err) {
        res.status(404).render("user/error-handling");
      }

    })
  } catch (error) {
    res.status(404).json({ status: false, error: 'Something went wrong on the server.' });
  }
}


const couponValidate = async (req, res) => {

  try {
    let response
    const couponCode = req.body.couponCode
    const totalAmount = req.body.totalAmount
    const userId = req.session.user._id



    const couponValidate = await CouponModel.findOne({ couponName: couponCode })
    if (couponValidate) {

      const existingCoupon = await OrderModel.findOne({ userId: userId, couponCode: couponCode })

      if (existingCoupon) {
        response = { status: false }

      } else {

        const couponDiscount = (totalAmount * couponValidate.couponPercentage) / 100;
        const discountTotal = (totalAmount - couponDiscount)

        response = { status: true, discountTotal }
      }

    } else {
      response = { status: false }
    }

    res.json(response)

  } catch (err) {
    res.status(404).render("user/error-handling");
  }
}


const WishlistHistory = async (req, res) => {

  try {
    const walletHistory = await OrderModel.find({ paymentMethod: "Wallet" })
    res.render("user/wallet-history", { walletHistory })
  } catch (err) {
    res.status(404).render("user/error-handling");
  }
}


const comingSoon = async (req, res) => {
  res.render("user/coming-soon")
}


const errHandler = async (req, res) => {
  res.render("user//error-handling")
}


const searchProducts = async (req, res) => {

  let searchs = req.query.search;
  // let searchProduct = await productHelper.searchProduct(search);
  var search = new RegExp(searchs, 'i')

  const searchProduct = await ProductModel.find({ $or: [{ name: search }, { category: search }] })

  res.json(searchProduct);

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
  invoiceReport,
  addNewAddressUser,
  addNewAddressCheckout,
  removeNewAddressUser,
  removeNewAddressCheckout,
  couponValidate,
  searchProducts,
  WishlistHistory,
  comingSoon,
  errHandler,
  errorHandler
};



