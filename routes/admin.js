const express = require('express');
const router = express.Router();
const adminControllers = require("../controllers/adminController")
const {adminLoginCheck}  = require("../controllers/adminController")


router.get("/",adminLoginCheck, adminControllers.adminDashboard)
router.get("/adminLoginView", adminControllers.adminLoginView)
router.get("/adminLogin", adminControllers.adminLogin)

router.post("/addProduct", adminControllers.addProduct)

module.exports = router