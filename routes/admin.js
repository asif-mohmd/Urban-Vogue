const express = require('express');
const router = express.Router();
const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })
const adminControllers = require("../controllers/adminController")
const productControllers = require("../controllers/productController")
const {adminLoginCheck}  = require("../controllers/adminController")
const {adminLoginVerify}  = require("../controllers/adminController")
const {upload} = require('../utils/imageHandler')

const imageUpload = upload.array('photos', 3)


//Get method listing 
router.get("/",adminLoginCheck, adminControllers.adminDashboard)
router.get("/login",adminLoginVerify, adminControllers.adminLoginView)
router.get("/addProduct", productControllers.addProductView)
router.get("/editProduct", productControllers.editProductView)
router.get("/userList",adminControllers.userList)


// Post method listing
router.post("/adminLogin", adminControllers.adminLogin)
router.post("/addProduct", upload.array('image',1), productControllers.addProduct)
router.post("/admin/delete-product",productControllers.deleteProduct)


module.exports = router