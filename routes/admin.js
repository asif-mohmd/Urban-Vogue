const express = require('express');
const router = express.Router();
const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })
const adminControllers = require("../controllers/adminController")
const productControllers = require("../controllers/productController")
const {adminLoginCheck}  = require("../middlewares/middlewares")
const {adminLoginVerify}  = require("../middlewares/middlewares")
const {upload} = require('../utils/imageHandler')

const imageUpload = upload.array('photos', 3)


//Get method listing 
router.get("/",adminLoginCheck, adminControllers.adminDashboard)
router.get("/login",adminLoginVerify, adminControllers.adminLoginView)
router.get("/addProduct",adminLoginCheck, productControllers.addProductView)
router.get("/editProductView",adminLoginCheck, productControllers.editProductView)
router.get("/editProductDetails",adminLoginCheck,productControllers.editProductDetails)
router.get("/delete-product",adminLoginCheck,productControllers.deleteProduct)
router.get("/userList",adminLoginCheck,adminControllers.userList)
router.get("/block-unblock",adminControllers.userBlockUnblock)
router.get("/list-unlist-product/:id",productControllers.listUnlistProduct)
router.get("/addCategory",adminControllers.addCategory)
router.get("/showCategory",adminControllers.showCategory)
router.get("/category-delete",adminControllers.categoryDelete)
router.get("/list-unlist-category/:id",adminControllers.listUnlistCategory)
router.get("/listedCategory",adminControllers.listedCategory)
router.get("/unListedCategory",adminControllers.unListedCategory)
router.get("/pending-orders",adminLoginCheck,adminControllers.pendingOrders)
router.get("/order-delivered",adminControllers.orderDelivered)
router.get("/delivered-orders",adminLoginCheck,adminControllers.delieveredOrders)
router.get("/cancelled-orders",adminControllers.cancelledOrders)
router.get("/order-cancelled",adminControllers.orderCancelled)
router.get("/deleted-products",adminControllers.deletedProducts)
router.get("/return-pending",adminControllers.returnPending)
router.get("/return-accept",adminControllers.returnAccept)
router.get("/return-defective",adminControllers.returnDefective)
router.get("/return-nonDefective",adminControllers.returnNonDefective)
router.get("/adminChartLoad", adminControllers.adminChartLoad);
router.get("/addCoupon",adminLoginCheck,adminControllers.addCoupon)
router.get("/showCoupon",adminControllers.showCoupon)
router.get("/listedCoupon",adminControllers.showListedCoupon)
router.get("/unlistedCoupon",adminControllers.showUnlistedCoupon)
router.get("/list-unlist-coupon/:id",adminControllers.listUnlistCoupon)
router.get("/coupon-delete",adminControllers.couponDelete)




// Post method listing
router.post("/adminLogin", adminControllers.adminLogin)
router.post("/addProduct", upload.array('image',3), productControllers.addProduct)
router.post("/edited-ProductDetails",upload.array('image',3),productControllers.productDetailsEdit)
router.post("/addNewCategory",adminControllers.addNewCategory)
router.post("/addNewCoupon",adminControllers.addNewCoupon)


// router.get("*",adminControllers.errorHandler)









module.exports = router