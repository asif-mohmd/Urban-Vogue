const express = require('express');
const loginControllers = require('../controllers/loginController');
const router = express.Router();



// {registerView, loginView }



router.get('/', loginControllers.registerView);
router.get('/login', loginControllers.loginView);



module.exports = router;