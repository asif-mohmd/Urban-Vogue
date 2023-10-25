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
router.get("/cart",verifyLogin,userControllers.cartView)
router.get("/addToCart",userControllers.addToCart)
router.get("/delete-cart-item",userControllers.deleteCartItem)
router.get("/checkout",userControllers.proceedToCheckout)
router.get("/orders",userControllers.ordersView)
router.get("/cancel-user-order",userControllers.cancelUserOrder)
router.get("/return-user-order",userControllers.returnUserOrder)
router.get("/order-detail-view",userControllers.orderDetailView)
router.get("/contact-page",userControllers.contactView)
router.get("/order-response",userControllers.orderResponseView)
router.get("/report",userControllers.loadReport)
router.get("/report-generate",userControllers.generateReport)
router.get("/invoice",userControllers.invoiceView)
router.get("/invoice-generate",userControllers.invoiceReport)
router.get("/product-list",productControllers.productListView)
router.get("/remove-new-address",userControllers.removeNewAddress)
router.get("/search",userControllers.searchProducts)



// POST Methods
router.post('/otpVerification', userControllers.otpVerification)
router.post('/registerUser', userControllers.registerUser)
router.post('/loginUser', userControllers.loginUser)
router.post("/changePassword",userControllers.changePassword)
router.post("/editProfile",userControllers.editProfile)
router.post("/change-product-quantity",userControllers.changeProductQuantity)
router.post("/place-order",userControllers.placeOrder)
router.post("/verify-payment",userControllers.verifyPayment)
router.post("/add-new-address",userControllers.addNewAddressUser)
router.post("/add-new-address-checkout",userControllers.addNewAddressCheckout)
router.post("/coupon-validate",userControllers.couponValidate)
router.post("/sort-all-products",productControllers.sortAllProducts)





module.exports = router;



// router.get("/wishlist",userControllers.wishlistView)
// router.get("/add-to-wishlist",userControllers.addToWishlist)
// router.get("/remove-wishlist-product",userControllers.removeWishlistProduct)