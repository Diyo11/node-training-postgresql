const express = require('express');

const router = express.Router();
const logger = require('../utils/logger')('Coach'); //??
const headleErrorAsync = require('../utils/handleErrorAsync')
const coachesController = require('../controller/coach')

router.get('/', headleErrorAsync(coachesController.get_coachList))       ///coaches/?per=?page=?

router.get('/:coachId', headleErrorAsync(coachesController.get_coachInfo))

module.exports = router;