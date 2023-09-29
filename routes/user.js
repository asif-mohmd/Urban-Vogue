const express = require('express');
const userControllers = require('../controllers/userController');
const productControllers = require('../controllers/productController');

const {verifyLogin,loginChecker} = require('../controllers/middlewares');
const router = express.Router();
const { protectRoute } = require("../auth/protect");
const { indexView } = require("../controllers/userController");

// {registerView, loginView }

// Get methods
// router.get('/', loginControllers.registerView);
router.get("/",verifyLogin,userControllers.indexView);
router.get('/login', loginChecker,userControllers.loginView);
router.get("/signup",loginChecker, userControllers.registerView)
router.get('/otpView', userControllers.otpView)
router.get("/product-details",productControllers.productDetails)
router.get("/logout",userControllers.userLogout)
router.get("/userProfile",userControllers.userProfile)
router.get("/cart",userControllers.cartView)
router.get("/addToCart",userControllers.addToCart)
router.get("/delete-cart-item",userControllers.deleteCartItem)
router.get("/checkout",userControllers.proceedToCheckout)
router.get("/orders",userControllers.OrdersView)


// POST Methods
router.post('/otpVerification', userControllers.otpVerification)
router.post('/registerUser', userControllers.registerUser)
router.post('/loginUser', userControllers.loginUser)
router.post("/changePassword",userControllers.changePassword)
router.post("/editProfile",userControllers.editProfile)
router.post("/change-product-quantity",userControllers.changeProductQuantity)
router.post("/place-order",userControllers.placeOrder)


module.exports = router;