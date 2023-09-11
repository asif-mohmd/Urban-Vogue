const express = require('express');
const router = express.Router();
const adminControllers = require("../controllers/adminController")
const productControllers = require("../controllers/productController")
const {adminLoginCheck}  = require("../controllers/adminController")
const {adminLoginVerify}  = require("../controllers/adminController")




router.get("/",adminLoginCheck, adminControllers.adminDashboard)
router.get("/login",adminLoginVerify, adminControllers.adminLoginView)
router.post("/adminLogin", adminControllers.adminLogin)
router.get("/addProduct", productControllers.addProductView)
router.post("/addProduct", productControllers.addProduct)

router.get("/userList",adminControllers.userList)



module.exports = router