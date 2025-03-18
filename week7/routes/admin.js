const express = require('express');

const router = express.Router();
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger');
const { isUndefined, isNumber, isValidString } = require('../utils/validUtils');
const isAuth = require('../middlewares/isAuth');
const isCoach = require('../middlewares/isCoach');
const headleErrorAsync = require('../utils/handleErrorAsync')
const adminController = require('../controller/admin')

router.post('/coaches/courses', isAuth, isCoach, headleErrorAsync(adminController.post_addCourses))

router.put('/coaches/courses/:courseId', isAuth, isCoach,headleErrorAsync(adminController.put_coachCourse))

router.post('/coaches/:userId', headleErrorAsync(adminController.post_addCoaches))

module.exports = router;