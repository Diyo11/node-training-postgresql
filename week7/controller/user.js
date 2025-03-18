const { dataSource } = require('../db/data-source')
const appError = require('../utils/appError')
const logger = require('../utils/logger')
const { isValidPassword, isUndefined, isNumber, isValidString} = require('../utils/validUtils')

const bcrypt = require('bcrypt');
const { generateJWT } = require('../utils/jwtUtils');
const saltRounds = 10;

const userController = {
    async post_signup(req, res, next){
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
    },

    async post_login(req, res, next){
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
                    id: findUser.id,
                    name: findUser.name
                }
            }
        })
    },

    async get_profile(req, res, next){
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
    },

    async put_profile(req, res, next){
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
            return;
        }

        res.status(200).json({
            status: 'success'
        })
    },

    async put_password(req, res, next){
        const { id } = req.user;
        const { password, new_password, confirm_new_password } = req.body;
        if( isUndefined(password) || isNumber(password) ||
            isUndefined(new_password) || isNumber(new_password) ||
            isUndefined(confirm_new_password) || isNumber(confirm_new_password))
        {
            return next(appError(400, '欄位未填寫正確'));
            // res.status(400).json({
            //     "status" : "failed",
            //     "message": "欄位未填寫正確"
            // })
            // return;
        }
        if (!isValidPassword(new_password) || !isValidPassword(confirm_new_password)) {
			return next(appError(400, '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'))
		}
		if (new_password === password) {
			return next(appError(400, '新密碼不能與舊密碼相同'))
		}
		if (new_password !== confirm_new_password ) {
			return next(appError(400, '新密碼與驗證新密碼不一致'))
		}
        
        const userRepo = dataSource.getRepository('User')
        const findUser = await userRepo.findOne({
            select:['password'],
            where:{
                id
            }
        })
        const isMatch = await bcrypt.compare(password, findUser.password)
        if(!isMatch){
            return next(appError(400, '密碼輸入錯誤'));
        }

        const hashPassword = await bcrypt.hash(new_password,saltRounds)
        const updatePassword = userRepo.update({
            id
        },{
            password: hashPassword
        })
        if(updatePassword.affected === 0){
            return next(appError(400, '更新使用者失敗'));
        }

        res.status(200).json({
            status:'success'
        })
    }
}

module.exports = userController