const express = require('express');
const router = express.Router();
const adminControllers = require("../controllers/adminController")


router.get("/", adminControllers.adminDashboard)
router.post("/addProduct", adminControllers.addProduct)

module.exports = router