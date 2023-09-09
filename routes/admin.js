const express = require('express');
const router = express.Router();
const adminControllers = require("../controllers/adminController")
const {adminLoginCheck}  = require("../controllers/adminController")


router.get("/",adminLoginCheck, adminControllers.adminDashboard)
router.get("/adminLoginView", adminControllers.adminLoginView)
router.post("/adminLogin", adminControllers.adminLogin)


router.get("/addProduct", adminControllers.addProductView)
router.post("/addProduct", adminControllers.addProduct)

module.exports = router