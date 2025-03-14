const express = require('express');

const router = express.Router();
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger');
const { isUndefined, isNumber, isValidString } = require('../utils/validUtils');
const { password } = require('../config/db');

const bcrypt = require('bcrypt');
const { generateJWT } = require('../utils/jwtUtils');
const appError = require('../utils/appError');
const saltRounds = 10;

const isAuth = require('../middlewares/isAuth');
const handleErrorAsync = require('../utils/handleErrorAsync');

const isValidPassword = (value) =>{                                     //檢查密碼
    const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/     //正規表達式檢驗是否符合
    // console.log(passwordPattern.test(value));
    return passwordPattern.test(value);
}

router.post('/signup', async(req, res, next) =>{
    const data = req.body;
    if(isUndefined(data.name) || !isValidString(data.name) || 
        isUndefined(data.email) || !isValidString(data.email) ||
        isUndefined(data.password) || isNumber(data.password))
    {
        res.status(400).json({
            status: "failed",
            message: "欄位未填寫正確"
        })
        return
    }
    if(!isValidPassword(data.password)){
        res.status(400).json({
            status: "failed",
            message: "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
        })
        return;
    }

    const userRepo = dataSource.getRepository('User');
    const findUser = await userRepo.findOne({
        where:{
            email:data.email
        }
    })
    console.log(findUser);
    if(findUser){
        res.status(409).json({
            status : "failed",
	        message: "Email已被使用"
        })
        return;
    }

    const hashPassword = await bcrypt.hash(data.password, saltRounds);
    const newUser = userRepo.create({
        name: data.name,
        password: hashPassword,
        email: data.email,
        role:'USER'
    });
    const result = await userRepo.save(newUser);

    res.status(201).json({
        status:"success",
        data:{
            user:{
                id: result.id,
                name: result.name,
            }
        }
    })
})

router.post('/login',async(req, res, next) =>{
    try{
        //檢查欄位
        const{ email, password } = req.body;
        if(!isValidString(email) || !isValidString(password)){
            res.status(400).json({
                status:'failed',
                message: '欄位未填寫正確'
            })
            return;
        }
        if(!isValidPassword(password)){
            res.status(400).json({
                status: 'failed',
                message: '密碼不符合規定，需包含英文數字大小寫8碼'
            })
            return;
        }
        const userRepo = dataSource.getRepository('User');
        //使用者不存在或密碼錯誤
        const findUser = await userRepo.findOne({
            select:['id', 'name', 'password'],  //有被鎖定，所以要用select選出欄位
            where:{
                email
                // :userRepo.email
            }
        })
        if(!findUser){
            next(appError(400, '使用者不存在'));
            return;
        }
        const isMatch = await bcrypt.compare(password, findUser.password);
        if(!isMatch){
            next(appError(400, '密碼錯誤'));
            return;
        }
    
        // JWT
        const token = generateJWT({
            id: findUser.id,
            role: findUser.role
        })

        res.status(201).json({
            status:'success',
            data: {
                token,
                user:{
                    name: findUser.name
                }
            }
        })
    }catch(error){
        next(error);
    }
})

router.get('/profile', isAuth, handleErrorAsync(async(req, res, next)=>{    //handleErrorAsync 共同處理try-catch錯誤
    const { id } = req.user;
    if(!isValidString(id)){
        return next(appError(400, "欄位未填寫正確"));
        // return;
    }
    const findUser = await dataSource.getRepository('User').findOne({
        where:{
            id
        }
    })
    res.status(200).json({
        status: 'success',
        data:{
            email: findUser.email,
            name: findUser.name
        }
    })
}))

router.put('/profile', isAuth, async(req, res, next)=>{
    try{
        const { id } = req.user;
        const { name } = req.body;
        if(!isValidString(name) || isUndefined(name) ||
            !/^[\u4e00-\u9fa5a-zA-Z0-9]{2,10}$/.test(name)){
            next(appError(400, '欄位未填寫正確'));
            return;
        }

        const userRepo = dataSource.getRepository('User');
        //檢查使用者名稱未變更
        const findUser = await userRepo.findOne({
            where:{ id }
        })
        if(findUser.name === name){
            next(appError(400, '使用者名稱未變更'));
            return;
        }
        //更新
        const updateUser = userRepo.update({
            //條件
            id
        },{
            //更新欄位
            name
        })
        if(updateUser.affected === 0){
            next(appError(400, '更新使用者失敗'));
        }

        res.status(200).json({
            status: 'success'
        })
    }catch(error){
        logger.error('取得使用者資料錯誤:', error)
        next(error);
    }
})

module.exports = router;