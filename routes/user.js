const express = require('express');
const userControllers = require('../controllers/userController');
const {verifyLogin,loginChecker} = require('../controllers/userController');
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
router.get("/product-details",userControllers.productDetails)
router.get("/admin/block-unblock",userControllers.userBlockUnlock)



// POST Methods
router.post('/otpVerification', userControllers.otpVerification)
router.post('/registerUser', userControllers.registerUser)
router.post('/loginUser', userControllers.loginUser)


module.exports = router;