const express = require('express');

const router = express.Router();
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('Coach'); //??

const { isValidString, isNumber } = require('../utils/validUtils');

router.get('/', async(req, res, next) =>{       ///coaches/?per=?page=?
    try{
        const{ per, page } = req.query;
        if(!isValidString(per) || isValidString(page)){
            res.status(400).json({
                status: "failed",
                message: "欄位未填寫正確"
            })
        }

        // ? 取得教練列表後，參數要用在哪邊???

        res.status(200).json({
            status: "success",
            data:[]
        })
    }catch(error){
        logger.error(error);
        next(error);
    }
})

router.get('/:coachId', async(req, res, next) => {
    try{
        const { coachId } = req.params;
        if(!isValidString(coachId)){
            res.status(400).json({
                status: "failed",
                message: "欄位未填寫正確"
            })
            return;
        }
        
        const coachRepo = dataSource.getRepository('Coach');
        const findCoach = await coachRepo.findOne({
            where:{
                id:coachId
            }
        })
        if(!findCoach){
            res.status(400).json({
                status: "failed",
                message: "使用者不存在"
            })
            return;
        }

        // const coachResult = await coachRepo.find({
        //     select:{
        //         id, user_id
        //     }
        // })
        console.log(findCoach);
        res.status(200).json({
            status: "success",
            data: findCoach
        })
    }catch(error){
        next(error);
    }
})

module.exports = router;