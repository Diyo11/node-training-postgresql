const express = require('express');

const router = express.Router();
const logger = require('../utils/logger');
const { password } = require('../config/db');

const isAuth = require('../middlewares/isAuth');
const handleErrorAsync = require('../utils/handleErrorAsync');
const userController = require('../controller/user')

router.post('/signup', userController.post_signup)

router.post('/login',handleErrorAsync(userController.post_login))

router.get('/profile', isAuth, handleErrorAsync(userController.get_profile))

router.put('/profile', isAuth, handleErrorAsync(userController.put_profile))

router.put('/password', isAuth, handleErrorAsync(userController.put_password))

module.exports = router;