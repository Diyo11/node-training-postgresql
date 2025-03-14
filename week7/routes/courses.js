const express = require('express');

const router = express.Router();
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger');
const { isUndefined, isNumber, isValidString } = require('../utils/validUtils');
const handleErrorAsync = require('../utils/handleErrorAsync');
const Course = require('../entities/Course');
const Skill = require('../entities/Skill');

// TODO week6 LV2
router.get('/', handleErrorAsync(async(req, res, next)=>{
    const package = await dataSource.getRepository('Course').find({
        // select:["id", "name", "description", "start_at", "end_at", "max_participants"],
        select:{
            id:true, 
            name:true, 
            description:true,
            start_at:true, 
            end_at:true, 
            max_participants:true,
            User:{
                name:true
            },
            Skill:{
                name:true
            }
        },
        relations: {
            User,
            Skill
        }
    })
    res.status(200).json({
        status:'success',
        data: package
    })
}))

module.exports = router;