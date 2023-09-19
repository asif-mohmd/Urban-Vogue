const express = require('express');
const router = express.Router();
const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })
const adminControllers = require("../controllers/adminController")
const productControllers = require("../controllers/productController")
const {adminLoginCheck}  = require("../controllers/middlewares")
const {adminLoginVerify}  = require("../controllers/middlewares")
const {upload} = require('../utils/imageHandler')

const imageUpload = upload.array('photos', 3)


//Get method listing 
router.get("/",adminLoginCheck, adminControllers.adminDashboard)
router.get("/login",adminLoginVerify, adminControllers.adminLoginView)
router.get("/addProduct", productControllers.addProductView)
router.get("/editProductView", productControllers.editProductView)
router.get("/editProductDetails",productControllers.editProductDetails)
router.get("/delete-product",productControllers.deleteProduct)
router.get("/userList",adminControllers.userList)
router.get("/block-unblock",adminControllers.userBlockUnblock)
router.get("/addCategory",adminControllers.addCategory)
router.get("/showCategory",adminControllers.showCategory)
router.get("/category-delete",adminControllers.categoryDelete)
router.get("/list-unlist-category/:id",adminControllers.listUnlistCategory)
router.get("/listedCategory",adminControllers.listedCategory)
router.get("/unListedCategory",adminControllers.unListedCategory)
router.get("/list-unlist-product/:id",productControllers.listUnlistProduct)



// Post method listing
router.post("/adminLogin", adminControllers.adminLogin)
router.post("/addProduct", upload.array('image',3), productControllers.addProduct)
router.post("/edited-ProductDetails",upload.array('image',1),productControllers.productDetailsEdit)
router.post("/addNewCategory",adminControllers.addNewCategory)






module.exports = router