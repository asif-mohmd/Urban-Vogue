const express = require('express');
const loginControllers = require('../controllers/loginController');
const router = express.Router();
const { protectRoute } = require("../auth/protect");
const { dashboardView } = require("../controllers/indexController");



// {registerView, loginView }



// router.get('/', loginControllers.registerView);
router.get('/login', loginControllers.loginView);
router.post('/registerUser',loginControllers.registerUser)
router.post('/loginUser',loginControllers.loginUser)
router.get("/", protectRoute, dashboardView);


module.exports = router;