const express = require('express');
const userControllers = require('../controllers/userController');
const router = express.Router();
const { protectRoute } = require("../auth/protect");
const { indexView } = require("../controllers/userController");



// {registerView, loginView }



// router.get('/', loginControllers.registerView);
router.get("/", indexView);
router.get('/login', userControllers.loginView);
router.get("/signup", userControllers.registerView)
router.post('/registerUser', userControllers.registerUser)
router.post('/loginUser', userControllers.loginUser)



module.exports = router;