const express = require('express');

const router = express.Router();
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('Coach'); //??
const headleErrorAsync = require('../utils/handleErrorAsync')
const coachesController = require('../controller/coach')

router.get('/', async(req, res, next) =>{       ///coaches/?per=?page=?
    try{
        
    }catch(error){
        logger.error(error);
        next(error);
    }
})

router.get('/:coachId', headleErrorAsync(coachesController.get_coachInfo))

module.exports = router;