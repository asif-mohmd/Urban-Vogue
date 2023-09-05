const express = require('express');
const {registerView, loginView } = require('../controllers/loginController');
const router = express.Router();







router.get('/', registerView);
router.get('/login', loginView);



module.exports = router;