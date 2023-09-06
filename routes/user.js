const express = require('express');
const loginControllers = require('../controllers/loginController');
const router = express.Router();
const { protectRoute } = require("../auth/protect");
const { dashboardView } = require("../controllers/indexController");



// {registerView, loginView }



// router.get('/', loginControllers.registerView);
router.get("/", protectRoute, dashboardView);
router.get('/login', loginControllers.loginView);
router.get("/signup",loginControllers.registerView)
router.post('/registerUser',loginControllers.registerUser)
router.post('/loginUser',loginControllers.loginUser)



module.exports = router;